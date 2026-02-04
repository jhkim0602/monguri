export const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
