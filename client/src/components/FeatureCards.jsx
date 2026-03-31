import { useState } from 'react'

const FEATURE_DATA = [
  {
    id: 'screenshot',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7M17 3H19C20.1046 3 21 3.89543 21 5V7M21 17V19C21 20.1046 20.1046 21 19 21H17M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    badge: 'New',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    title: 'Screenshot capture',
    desc: 'Upload spending screenshots in seconds and instantly begin your audit.',
    steps: [
      'Take a screenshot of any payment confirmation.',
      'Upload it to NiroCore via the Scan tool.',
      'Auto-imported details show up in your dashboard.'
    ],
    actionKey: 'scan',
    question: 'How accurate is the OCR technology?'
  },
  {
    id: 'reminders',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6981 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    badge: 'Most used',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    title: 'Renewal reminders',
    desc: 'Receive proactive nudges before every renewal window and avoid silent charges.',
    steps: [
      'Set reminder thresholds (e.g., 3 days before).',
      'Get notified via Email, SMS, or Push.',
      'Take action: keep, cancel, or switch plans.'
    ],
    actionKey: 'notifications',
    question: 'Can I set custom reminder times?'
  },
  {
    id: 'guides',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.42846 5.02354 8 5.02354C6.57154 5.02354 5.16788 5.47686 4 6.25278V19.2528C5.16788 18.4769 6.57154 18.0235 8 18.0235C9.42846 18.0235 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.5715 5.02354 16 5.02354C17.4285 5.02354 18.8321 5.47686 20 6.25278V19.2528C18.8321 18.4769 17.4285 18.0235 16 18.0235C14.5715 18.0235 13.1679 18.4769 12 19.2528" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    badge: 'Save money',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    title: 'Cancel guides',
    desc: 'Follow clear cancellation playbooks tailored to each subscription type.',
    steps: [
      'Locate the "How to Cancel" panel on service details.',
      'Follow verified step-by-step instructions.',
      'Mark as cancelled to track your annual savings.'
    ],
    actionKey: 'dashboard',
    question: 'What if my service isn\'t listed?'
  }
]

export default function FeatureCards({ onAction, onAsk }) {
  const [expandedIndex, setExpandedIndex] = useState(1)

  return (
    <div className="mx-auto mt-20 md:mt-32 max-w-screen-2xl px-4 md:px-8 lg:px-12 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURE_DATA.map((card, index) => {
          const isExpanded = expandedIndex === index
          
          return (
            <div 
              key={card.id}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setExpandedIndex(isExpanded ? null : index)
                }
              }}
              className={`group flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isExpanded ? 'ring-1 ring-primary/50 bg-gray-50/30 dark:bg-gray-800/20' : ''
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors ${isExpanded ? 'text-primary bg-primary/5' : 'group-hover:text-primary'}`}>
                  {card.icon}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px] transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                      add
                    </span>
                  </div>
                </div>
              </div>

              {/* Title & Static description */}
              <h3 className="font-headline text-xl font-bold text-gray-900 dark:text-white mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                {card.desc}
              </p>

              {/* Collapsible Panel */}
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100 mb-2' : 'max-h-0 opacity-0'}`}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the panel
              >
                <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-2 space-y-5">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">How it works</p>
                    {card.steps.map((step, sIdx) => (
                      <div key={sIdx} className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {sIdx + 1}
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAction?.(card.actionKey)
                      }}
                      className="w-full signature-gradient text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-md cursor-pointer"
                    >
                      Start Exploration
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAsk?.(card.question)
                      }}
                      className="w-full flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary text-[10px] font-bold tracking-wide py-1 transition-colors cursor-pointer group/ask"
                    >
                      <span className="material-symbols-outlined text-[14px]">help</span>
                      {card.question}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
