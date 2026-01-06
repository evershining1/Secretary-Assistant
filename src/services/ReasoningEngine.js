export class ReasoningEngine {
    /**
     * heuristic to link a task to the most relevant goal.
     * In a real agent, this would use embeddings/LLM.
     * Here we use keyword matching.
     */
    static alignTaskToGoal(task, goals) {
        if (!goals || goals.length === 0) return null;

        let bestMatch = null;
        let maxScore = 0;

        const taskKeywords = task.title.toLowerCase().split(' ');

        goals.forEach(goal => {
            const goalKeywords = goal.title.toLowerCase().split(' ');
            let score = 0;

            // Simple keyword overlap
            taskKeywords.forEach(word => {
                if (word.length > 3 && goalKeywords.includes(word)) { // Filter small words
                    score += 1;
                }
            });

            // Bonus for type matching if inferred (not implemented yet)

            if (score > maxScore) {
                maxScore = score;
                bestMatch = goal.id;
            }
        });

        // Threshold for alignment
        return maxScore > 0 ? bestMatch : null;
    }

    /**
     * Suggest a priority based on goal alignment
     */
    static suggestPriority(task, alignedGoal) {
        if (alignedGoal) {
            // If aligned to a yearly goal, maybe high impact?
            // If aligned to a monthly goal with low progress, high priority.
            return 'high';
        }
        return 'medium';
    }
}
