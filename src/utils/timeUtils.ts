export const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const parseTimeValue = (value?: string | null): number | null => {
    if (!value) return null;
    const parts = value.split(":").map(Number);
    const [hour, minute] = parts;
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return hour * 60 + minute;
};

const resolveTaskTimeSpentSeconds = (task: any): number => {
    if (!task || typeof task !== "object") return 0;

    const candidates = [task.timeSpentSec, task.time_spent_sec, task.timeSpent];
    for (const candidate of candidates) {
        if (typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0) {
            return Math.floor(candidate);
        }
    }

    return 0;
};

export const computeStudySecondsFromTasks = (tasks: any[]): number => {
    if (!Array.isArray(tasks) || tasks.length === 0) return 0;

    let totalSeconds = 0;

    tasks.forEach((task) => {
        const start = parseTimeValue(task?.startTime ?? task?.start_time);
        const end = parseTimeValue(task?.endTime ?? task?.end_time);

        if (start !== null && end !== null) {
            let diffMinutes = end - start;
            if (diffMinutes <= 0) diffMinutes += 24 * 60;
            if (diffMinutes > 0) {
                totalSeconds += diffMinutes * 60;
                return;
            }
        }

        totalSeconds += resolveTaskTimeSpentSeconds(task);
    });

    return totalSeconds;
};

export const computeDailyStudySeconds = (
    tasks: any[],
    fallbackSeconds?: number | null,
) => {
    const fromTasks = computeStudySecondsFromTasks(tasks);
    if (fromTasks > 0) return fromTasks;

    if (
        typeof fallbackSeconds === "number" &&
        Number.isFinite(fallbackSeconds) &&
        fallbackSeconds > 0
    ) {
        return Math.floor(fallbackSeconds);
    }

    return 0;
};

export const generateTimeBlocksFromTasks = (tasks: any[]) => {
    const blocks: { [key: string]: string } = {};

    tasks.forEach(task => {
        if (!task.startTime || !task.endTime || !task.categoryId) return;

        const [startH, startM] = task.startTime.split(':').map(Number);
        const [endH, endM] = task.endTime.split(':').map(Number);

        let currentH = startH;
        let currentM = Math.floor(startM / 10) * 10;

        while (currentH < endH || (currentH === endH && currentM < endM)) {
            const timeKey = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
            blocks[timeKey] = task.categoryId;

            currentM += 10;
            if (currentM >= 60) {
                currentM = 0;
                currentH += 1;
            }
        }
    });

    return blocks;
};
