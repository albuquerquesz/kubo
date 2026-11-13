import type {
	ProductEventName,
	ProductEvents,
	SuperProperties,
	TelemetryProperties,
} from "./catalog";
import { type SilentErrorKind, silentErrors } from "./silent-errors";
import { createBufferSink, type TelemetrySink } from "./sink";
import { toError } from "./to-error";

type ContextProvider = () => TelemetryProperties;

// Um erro repetido a cada frame vira um reporte; o total por sessão também tem teto.
const SESSION_REPORT_LIMIT = 25;

const initialBuffer = () => createBufferSink();

// Parâmetros tipados alargam os literais para o tipo da porta sem anotar a variável.
const asSink = (target: TelemetrySink) => target;
const asProvider = (provider: ContextProvider) => provider;
const emptyContext = asProvider(() => ({}));

let buffer = initialBuffer();
let sink = asSink(buffer.sink);
let readContext = emptyContext;
const reported = new Set<string>();

export const installSink = (target: TelemetrySink) => {
	buffer.flushInto(target);
	sink = target;
};

export const setErrorContext = (provider: ContextProvider) => {
	readContext = provider;
};

export const readErrorContext = () => readContext();

export const trackEvent = <Name extends ProductEventName>(
	name: Name,
	properties: ProductEvents[Name],
) => sink.capture(name, properties);

export const registerProperties = (properties: SuperProperties) => sink.register(properties);

const isRepeated = (fingerprint: string) =>
	reported.has(fingerprint) || reported.size >= SESSION_REPORT_LIMIT;

// Com `match_id` nos detalhes, o mesmo problema volta a ser reportado em cada partida.
export const reportSilentError = <Thrown>(
	kind: SilentErrorKind,
	thrown: Thrown,
	details: TelemetryProperties = {},
) => {
	const error = toError(thrown);
	const fingerprint = `${kind}:${error.message}:${details.match_id ?? ""}`;
	if (isRepeated(fingerprint)) return;
	reported.add(fingerprint);
	const context = { ...readContext(), ...details };
	sink.captureException({ ...silentErrors[kind], kind, error, context });
};

// Só para testes: volta ao estado de antes da instalação.
export const resetTelemetry = () => {
	buffer = initialBuffer();
	sink = asSink(buffer.sink);
	readContext = emptyContext;
	reported.clear();
};
