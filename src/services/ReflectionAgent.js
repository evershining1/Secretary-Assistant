export class ReflectionAgent {
    static generateWeeklyInsights(tasks) {
        const completed = tasks.filter(t => t.completed && !t.isExternal).length;
        const total = tasks.filter(t => !t.isExternal).length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        let insight = `You've completed ${rate}% of your planned tasks this week.`;

        if (rate > 80) {
            insight += " Outstanding focus! You're crushing your goals.";
        } else if (rate > 50) {
            insight += " Good progress, but verify if you're overcommitting.";
        } else {
            insight += " Consider reducing your daily load to build momentum.";
        }

        return {
            rate,
            message: insight,
            productivityScore: rate // simple proxy
        };
    }
}
