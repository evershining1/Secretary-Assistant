import React, { useState } from 'react';
import { Check, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

/**
 * PricingPage - High-conversion landing for Premium Tier
 */
function PricingPage() {
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
    const navigate = useNavigate();

    const plans = [
        {
            name: 'Free',
            price: '0',
            description: 'Essential organization for individuals.',
            features: [
                '1 Calendar Integration',
                'Basic Goal Tracking',
                'Community Support',
                'Standard NLP Parsing',
                'Ad-Supported'
            ],
            buttonText: 'Current Plan',
            isPremium: false
        },
        {
            name: 'Premium',
            price: billingCycle === 'monthly' ? '5' : '4',
            period: billingCycle === 'monthly' ? '/mo' : '/mo',
            description: 'The ultimate Life OS experience.',
            features: [
                'Unlimited Calendar Sync',
                'Advanced Goal AI',
                'Priority Support (Emily AI)',
                'Priority Smart Detection',
                'Completely Ad-Free',
                'Exclusive UI Themes'
            ],
            buttonText: 'Upgrade Now',
            isPremium: true,
            featured: true
        }
    ];

    return (
        <div className="py-20 max-w-5xl mx-auto px-6">
            <div className="text-center mb-16 animate-in slide-in-from-top-4 duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-skin-accent/10 text-skin-accent rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                    <Sparkles size={14} />
                    <span>Choose Your Plan</span>
                </div>
                <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                    Elevate Your <span className="text-skin-accent">Productivity</span>
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
                    Unlock the full potential of Secretary and align every second of your day with your long-term vision.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4">
                    <span className={clsx("text-sm font-bold", billingCycle === 'monthly' ? "text-slate-900 dark:text-white" : "text-slate-400")}>Monthly</span>
                    <button
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                        className="w-14 h-8 bg-slate-200 dark:bg-white/10 rounded-full relative p-1 transition-colors"
                    >
                        <div className={clsx(
                            "w-6 h-6 bg-skin-accent rounded-full transition-all shadow-lg",
                            billingCycle === 'annual' ? "translate-x-6" : "translate-x-0"
                        )} />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className={clsx("text-sm font-bold", billingCycle === 'annual' ? "text-slate-900 dark:text-white" : "text-slate-400")}>Annual</span>
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase">Save 20%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch h-full">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={clsx(
                            "relative p-10 rounded-[40px] border flex flex-col transition-all duration-500 group",
                            plan.featured
                                ? "bg-slate-900 dark:bg-slate-800 text-white border-slate-800 dark:border-white/10 shadow-2xl scale-105 z-10"
                                : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-200"
                        )}
                    >
                        {plan.featured && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-skin-accent text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg shadow-skin-accent/40 uppercase tracking-widest">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                            <p className={clsx("text-sm", plan.featured ? "text-slate-400" : "text-slate-500")}>{plan.description}</p>
                        </div>

                        <div className="mb-10 flex items-baseline gap-1">
                            <span className="text-5xl font-black">${plan.price}</span>
                            <span className={clsx("text-xl font-medium", plan.featured ? "text-slate-500" : "text-slate-400")}>{plan.period || ''}</span>
                            {billingCycle === 'annual' && plan.isPremium && (
                                <span className="ml-2 text-xs text-emerald-500 font-bold">($48 billed annually)</span>
                            )}
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-3 text-sm font-medium">
                                    <div className={clsx("w-5 h-5 rounded-full flex items-center justify-center shrink-0", plan.featured ? "bg-skin-accent/20 text-skin-accent" : "bg-slate-100 dark:bg-white/10 text-slate-400")}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            disabled={!plan.isPremium}
                            onClick={() => navigate('/checkout', { state: { plan: billingCycle } })}
                            className={clsx(
                                "w-full py-4 rounded-[20px] font-bold transition-all flex items-center justify-center gap-2 group",
                                plan.featured
                                    ? "bg-skin-accent text-white shadow-xl shadow-skin-accent/20 hover:scale-[1.02] active:scale-95"
                                    : "bg-slate-100 dark:bg-white/10 text-slate-400 cursor-default"
                            )}
                        >
                            <span>{plan.buttonText}</span>
                            {plan.isPremium && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="text-center">
                    <div className="w-12 h-12 bg-skin-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-skin-accent">
                        <Shield size={24} />
                    </div>
                    <h4 className="font-bold mb-2 dark:text-white">Secure Payments</h4>
                    <p className="text-sm text-slate-500">256-bit SSL encrypted checkout and compliance.</p>
                </div>
                <div className="text-center">
                    <div className="w-12 h-12 bg-skin-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-skin-accent">
                        <Zap size={24} />
                    </div>
                    <h4 className="font-bold mb-2 dark:text-white">Instant Access</h4>
                    <p className="text-sm text-slate-500">Upgrade takes seconds. No restart required.</p>
                </div>
                <div className="text-center">
                    <div className="w-12 h-12 bg-skin-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-skin-accent">
                        <Check size={24} />
                    </div>
                    <h4 className="font-bold mb-2 dark:text-white">Cancel Anytime</h4>
                    <p className="text-sm text-slate-500">No long-term contracts. Simple one-click cancel.</p>
                </div>
            </div>
        </div>
    );
}

export default PricingPage;
