type Listener<Value> = (value: Value) => void;
type ListenerFailure<Value> = <Thrown>(error: Thrown, value: Value) => void;

// Canal de publicação: um ouvinte que lança não impede os seguintes de receber o valor.
export const createChannel = <Value>(onListenerFailure: ListenerFailure<Value>) => {
	const listeners = new Set<Listener<Value>>();

	const notify = (listener: Listener<Value>, value: Value) => {
		try {
			listener(value);
		} catch (error) {
			onListenerFailure(error, value);
		}
	};

	const publish = (value: Value) => {
		for (const listener of listeners) notify(listener, value);
	};

	const subscribe = (listener: Listener<Value>) => {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	};

	return { publish, subscribe };
};
