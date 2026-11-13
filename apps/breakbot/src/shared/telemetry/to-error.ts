// Qualquer valor lançado vira um Error com mensagem legível, para o stack trace e o agrupamento.
export const toError = <Thrown>(thrown: Thrown) => {
	if (thrown instanceof Error) return thrown;
	return new Error(
		typeof thrown === "string" ? thrown : (JSON.stringify(thrown) ?? String(thrown)),
	);
};
