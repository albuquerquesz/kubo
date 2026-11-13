import type { ProductEventName, ProductEvents, SuperProperties } from "./catalog";
import type { SilentErrorReport } from "./silent-errors";

export type TelemetrySink = {
	capture: <Name extends ProductEventName>(name: Name, properties: ProductEvents[Name]) => void;
	captureException: (report: SilentErrorReport) => void;
	register: (properties: SuperProperties) => void;
};

export const noopSink = {
	capture: () => {},
	captureException: () => {},
	register: () => {},
} satisfies TelemetrySink;

export const consoleSink = {
	capture: (name, properties) => console.info("[telemetria]", name, properties),
	captureException: (report) =>
		console.warn("[telemetria]", report.kind, report.error, report.context),
	register: (properties) => console.info("[telemetria] super properties", properties),
} satisfies TelemetrySink;

type Pending = (sink: TelemetrySink) => void;

// Guarda o que acontece antes do SDK carregar e repassa quando o sink real é instalado.
const BUFFER_LIMIT = 200;

export const createBufferSink = () => {
	const pending = new Array<Pending>();
	const hold = (call: Pending) => {
		if (pending.length < BUFFER_LIMIT) pending.push(call);
	};
	const sink = {
		capture: (name, properties) => hold((target) => target.capture(name, properties)),
		captureException: (report) => hold((target) => target.captureException(report)),
		register: (properties) => hold((target) => target.register(properties)),
	} satisfies TelemetrySink;
	const flushInto = (target: TelemetrySink) => {
		for (const call of pending.splice(0)) call(target);
	};
	return { sink, flushInto };
};
