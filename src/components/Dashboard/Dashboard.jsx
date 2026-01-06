import React from 'react';
import useStore from '../../store/useStore';
import DailyGreeting from './DailyGreeting';
import ProgressWidget from './ProgressWidget';
import TaskList from '../Tasks/TaskList';
import SmartSuggest from './SmartSuggest';
import { Sparkles } from 'lucide-react';
import MilestoneWidget from './MilestoneWidget';
import OnboardingModal from '../Auth/OnboardingModal';

function Dashboard() {
    const syncExternalEvents = useStore(state => state.syncExternalEvents);
    const designMyDay = useStore(state => state.designMyDay);

    // Initial sync
    React.useEffect(() => {
        const CalendarIntegrationService = import('../../services/CalendarIntegrationService').then(m => {
            m.CalendarIntegrationService.syncAll();
            m.CalendarIntegrationService.startAutoSync(15);
        });
    }, []);

    return (
        <div className="pt-8 pb-20 relative">
            <div className="flex justify-between items-start mb-8">
                <DailyGreeting />
                <button
                    onClick={designMyDay}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg active:scale-95 transition-all text-sm"
                >
                    <Sparkles size={16} />
                    Design My Day
                </button>
            </div>

            <div className="mb-8">
                <MilestoneWidget />
            </div>

            <ProgressWidget />
            <TaskList />
            <SmartSuggest />
            <OnboardingModal />
        </div>
    );
}

export default Dashboard;
