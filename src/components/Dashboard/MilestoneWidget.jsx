import React from 'react';
import useStore from '../../store/useStore';
import { Trophy, Flame, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

function MilestoneWidget() {
    const user = useStore(state => state.user);
    const progressToNextLevel = (user.xp % 1000) / 10; // 0-100%

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-5 -mb-5"></div>

            <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                        <Trophy size={24} className="text-yellow-300" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">Current Level</div>
                        <div className="text-2xl font-black">{user.level}</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                    <Flame size={16} className="text-orange-300 fill-orange-300" />
                    <span className="font-bold text-sm">{user.streak} Day Streak</span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-indigo-100">
                    <span>{user.xp} XP</span>
                    <span>{(user.level * 1000)} XP</span>
                </div>
                <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNextLevel}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full relative"
                    >
                        <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50"></div>
                    </motion.div>
                </div>
                <div className="text-right text-[10px] text-indigo-200 font-medium mt-1">
                    {1000 - (user.xp % 1000)} XP to Level {user.level + 1}
                </div>
            </div>
        </div>
    );
}

export default MilestoneWidget;
