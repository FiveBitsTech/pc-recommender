'use client'

import { useEffect, useRef } from 'react'

import { useRouter } from 'next/navigation'

import Avatar from '@mui/material/Avatar'

import useAdvisorChat from './hooks/useAdvisorChat'
import AdvisorResults from './components/AdvisorResults'
import BuildResult from '@/views/builder/components/BuildResult'
import BudgetSlider from './components/BudgetSlider'
import styles from './index.module.css'

const DEVICE_OPTIONS = [
  {
    id: 'desktop',
    icon: 'ri-computer-line',
    title: 'PC completa de escritorio',
    description: 'Un equipo de escritorio listo desde cero.',
  },
  {
    id: 'laptop',
    icon: 'ri-macbook-line',
    title: 'Laptop',
    description: 'Un equipo portátil para llevar a cualquier lugar.',
  },
  {
    id: 'build',
    icon: 'ri-cpu-line',
    title: 'Armar mi propia PC',
    description: 'Elige componentes individuales con compatibilidad garantizada.',
  },
]

const RequirementsPage = () => {
  const router = useRouter()
  const messagesEndRef = useRef(null)

  const {
    messages,
    currentStep,
    currentOptions,
    isTyping,
    isCompleted,
    isLoadingRecs,
    recommendations,
    buildResult,
    deviceSelected,
    showRetry,
    selectOption,
    selectDevice,
    retry,
  } = useAdvisorChat()

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleDeviceSelect = (option) => {
    if (option.id === 'build') {
      // Start builder flow within the same chat
      selectDevice('build', option.title)

      return
    }

    selectDevice(option.id, option.title)
  }

  const handleOptionSelect = (option) => {
    const stepIds = ['usageType', 'budget', 'priority']

    selectOption(stepIds[currentStep], option.value, option.label)
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.outerCard}>
        <div className={styles.innerGradient}>
          <div className={styles.chatContainer}>
            {/* Header */}
            <div className={styles.chatHeader}>
              <div className={styles.chatBrand} onClick={() => router.push('/home')} style={{ cursor: 'pointer' }}>
                <div className={styles.chatBrandIcon}>
                  <img src='/images/icons/star-ai.svg' alt='AI' className={styles.starIcon} />
                </div>
                <div>
                  <p className={styles.chatBrandName}>PC COTIZA-IA</p>
                  <p className={styles.chatBrandSubtitle}>Asesor inteligente</p>
                </div>
              </div>
              <div className={styles.headerRight}>
                <div className={styles.onlineBadge}>
                  <span className={styles.onlineDot} />
                  <span className={styles.onlineText}>En línea</span>
                </div>
                {isCompleted && (
                  <button className={styles.newSearchButton} onClick={() => window.location.reload()}>
                    <i className='ri-refresh-line' />
                    <span>Nueva búsqueda</span>
                  </button>
                )}
              </div>
            </div>

            {/* Chat body */}
            <div className={styles.chatBody}>
              {/* Show results when recommendations are loaded */}
              {isCompleted && recommendations.length > 0 ? (
                <div>
                  <AdvisorResults recommendations={recommendations} />
                  <div className={styles.chatFooter}>
                    <p className={styles.chatFooterText}>
                      No es necesario saber de tecnología — solo cuéntanos qué necesitas
                    </p>
                  </div>
                </div>
              ) : isCompleted && buildResult ? (
                <div style={{ padding: '24px', overflowY: 'auto' }}>
                  <BuildResult result={buildResult} />
                </div>
              ) : (
                <>
                  <div className={styles.chatMessages}>
                    {/* Bot avatar */}
                    <div className={styles.botAvatar}>
                      <i className='ri-robot-2-line' style={{ fontSize: '2rem', color: '#3d95ee' }} />
                    </div>

                    {/* Messages + options */}
                    <div className={styles.messagesColumn}>
                      {/* Initial bot messages */}
                      <div className={styles.messagesArea}>
                        <div className={styles.botBubble}>
                          ¡Hola! Soy tu asesor inteligente de COTIZA IA. No necesitas saber de computadoras; yo te ayudaré. Te haré algunas preguntas sencillas para encontrar la mejor opción para ti.
                        </div>
                        <div className={styles.botBubble}>
                          Para empezar, ¿qué estás buscando hoy?
                        </div>

                        {/* Conversation messages */}
                        {messages.map((msg, index) => (
                          <div key={index} className={msg.type === 'user' ? styles.userMessageRow : ''}>
                            {msg.type === 'user' ? (
                              <div className={styles.userMessage}>
                                <div className={styles.userBubble}>{msg.text}</div>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#3d95ee', fontSize: '0.75rem' }}>Tú</Avatar>
                              </div>
                            ) : (
                              <div className={styles.botBubble}>{msg.text}</div>
                            )}
                          </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                          <div className={styles.typingIndicator}>
                            <span className={styles.typingDot} />
                            <span className={styles.typingDot} />
                            <span className={styles.typingDot} />
                          </div>
                        )}

                        {/* Inline options — after bot question */}
                        {deviceSelected && currentOptions && !isTyping && !isCompleted && currentStep !== 1 && (
                          <div className={styles.smallOptionsGrid}>
                            {currentOptions.map((option) => (
                              <div
                                key={option.value}
                                className={styles.smallOptionCard}
                                onClick={() => handleOptionSelect(option)}
                              >
                                <p className={styles.smallOptionLabel}>{option.label}</p>
                                <p className={styles.smallOptionDesc}>{option.description}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Budget slider inline */}
                        {deviceSelected && currentStep === 1 && !isTyping && !isCompleted && (
                          <BudgetSlider
                            minBudget={currentOptions?.[0]?.value || 1500}
                            onConfirm={(value, label) => handleOptionSelect({ value, label })}
                          />
                        )}

                        {/* Retry */}
                        {showRetry && (
                          <div className={styles.smallOptionsGrid}>
                            <div className={styles.smallOptionCard} onClick={retry}>
                              <p className={styles.smallOptionLabel}>Intentar con otras opciones</p>
                              <p className={styles.smallOptionDesc}>Cambiar uso, presupuesto o tipo de equipo</p>
                            </div>
                          </div>
                        )}

                        <div ref={messagesEndRef} />
                      </div>

                      {/* Retry button when no results */}
                      {showRetry && (
                        <div className={styles.smallOptionsGrid}>
                          <div className={styles.smallOptionCard} onClick={retry}>
                            <p className={styles.smallOptionLabel}>Intentar con otras opciones</p>
                            <p className={styles.smallOptionDesc}>Cambiar uso, presupuesto o tipo de equipo</p>
                          </div>
                        </div>
                      )}

                      {/* Option cards — initial device selection */}
                      {!deviceSelected && !isTyping && (
                        <div className={styles.optionCards}>
                          {DEVICE_OPTIONS.map((option) => (
                            <div
                              key={option.id}
                              className={styles.optionCard}
                              onClick={() => handleDeviceSelect(option)}
                            >
                              <div className={styles.optionIconWrapper}>
                                <i className={option.icon} />
                              </div>
                              <div className={styles.optionContent}>
                                <p className={styles.optionTitle}>{option.title}</p>
                                <p className={styles.optionDescription}>{option.description}</p>
                                <div className={styles.optionAction}>
                                  <span>Elegir esta opción</span>
                                  <i className='ri-arrow-right-line' />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Footer */}
                  <div className={styles.chatFooter}>
                    <p className={styles.chatFooterText}>
                      {isTyping ? 'El asesor está escribiendo...' : isCompleted ? 'Buscando las mejores opciones para ti...' : 'Toca una opción para continuar'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequirementsPage
