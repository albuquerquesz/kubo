export const formatClock = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const paddedSeconds = String(Math.floor(seconds % 60)).padStart(2, "0");
	return `${minutes}:${paddedSeconds}`;
};
