import type { ProductEventName, ProductEvents, SuperProperties } from "./catalog";
import type { SilentErrorReport } from "./silent-errors";
import type { TelemetrySink } from "./sink";

type RecordedByName = {
	[Name in ProductEventName]: ProductEvents[Name][];
};

const emptyBuckets = () =>
	({
		$pageview: [],
		match_started: [],
		intro_skipped: [],
		match_first_input: [],
		wave_completed: [],
		match_ended: [],
		match_abandoned: [],
		results_action_clicked: [],
	}) satisfies RecordedByName;

const asBuckets = (buckets: RecordedByName) => buckets;

// Sink em memória: o seam dos testes da telemetria.
export const createRecordingSink = () => {
	const names = new Array<ProductEventName>();
	const exceptions = new Array<SilentErrorReport>();
	const registered = new Array<SuperProperties>();
	const buckets = asBuckets(emptyBuckets());
	const sink = {
		capture: (name, properties) => {
			names.push(name);
			buckets[name].push(properties);
		},
		captureException: (report) => exceptions.push(report),
		register: (properties) => registered.push(properties),
	} satisfies TelemetrySink;
	const named = <Name extends ProductEventName>(name: Name) => buckets[name];
	return { sink, names, exceptions, registered, named };
};
