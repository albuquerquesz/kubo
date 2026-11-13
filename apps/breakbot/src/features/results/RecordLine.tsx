import type { MatchResult } from "#/features/progress";
import { delayStyle } from "#/shared/animation-delay";
import { standRecord } from "./record-standing";
import { reveal } from "./reveal";

type RecordLineProps = {
	result: MatchResult;
};

// Contexto do recorde numa linha só, sem caixa: informa sem disputar atenção com os números.
export const RecordLine = ({ result }: RecordLineProps) => (
	<p
		className="m-0 animate-rise text-balance text-center font-bold text-[12px] text-mute"
		style={delayStyle(reveal.record)}
		data-testid="record-context"
	>
		{standRecord(result)}
	</p>
);
