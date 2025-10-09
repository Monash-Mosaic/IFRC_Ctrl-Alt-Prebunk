'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LifeIcon from '../components/LifeIcon.jsx'
import './welcome.css'

export default function Welcome() {
  const [step, setStep] = useState(0) // 0=Welcome-I, 1=Mission, 2=Context
  const [showEcho, setShowEcho] = useState(false)
  const [showPaula, setShowPaula] = useState(false)
  const [showEchoMsg, setShowEchoMsg] = useState(false)
  const [showPaulaMsg, setShowPaulaMsg] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (step === 0) {
      setShowEcho(false)
      setShowPaula(false)
      setShowEchoMsg(false)
      setShowPaulaMsg(false)

      const timers = []
      timers.push(setTimeout(() => setShowEcho(true), 2000))
      timers.push(setTimeout(() => setShowPaula(true), 3000))
      timers.push(setTimeout(() => setShowEchoMsg(true), 4000))
      timers.push(setTimeout(() => setShowPaulaMsg(true), 6000))
      return () => timers.forEach(clearTimeout)
    }
  }, [step])

  const nextStep = () => {
    if (step < 2) setStep(prev => prev + 1)
  }

  return (
    <div className="welcome-screen">
      <AnimatePresence mode="wait">
        {/* --- Welcome-I --- */}
        {step === 0 && (
          <motion.div
            key="welcome1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="dialog-container"
          >
            <h2>WELCOME</h2>

            <div className="characters">
              {/* Echo */}
              {showEcho && (
                <motion.div className="character-msg echo-container">
                  <div className="icon-with-name">
                    <motion.div
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Image src="/images/characters/echo.png" alt="Echo" className="character" width={100} height={100} />
                    </motion.div>
                    <div className="char-name">Echo</div>
                  </div>
                  {showEchoMsg && (
                    <motion.p
                      className="msg right"
                      key="echo-msg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <strong>Meet Echo, a shadowy figure who thrives in echo chambers, twisting facts and feeding lies.</strong>
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* Paula */}
              {showPaula && (
                <motion.div className="character-msg paula-container">
                  {showPaulaMsg && (
                    <motion.p
                      className="msg left"
                      key="paula-msg"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <strong>And meet Paula, an ordinary person just trying to make sense of the world -- but Echo is whispering falsehoods into their feed.</strong>
                    </motion.p>
                  )}
                  <div className="icon-with-name">
                    <motion.div
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Image src="/images/characters/paula.png" alt="Paula" className="character" width={100} height={100} />
                    </motion.div>
                    <div className="char-name">Paula</div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* --- Mission --- */}
        {step === 1 && (
          <motion.div
            key="mission"
            className="mission-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="mission-title">YOUR MISSION</h2>

            <div className="mission-icons">
              <motion.div
                className="icon-with-name"
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 12, delay: 0.3 }}
              >
                <Image src="/images/characters/echo.png" alt="Echo" className="character" width={100} height={100} />
                <div className="char-name">Echo</div>
              </motion.div>

              <div className="vs-text">VS</div>

              <motion.div
                className="icon-with-name"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 12, delay: 0.3 }}
              >
                <Image src="/images/characters/paula.png" alt="Paula" className="character" width={100} height={100} />
                <div className="char-name">Paula</div>
              </motion.div>
            </div>

            <div className="mission-message-wrapper">
              <motion.p
                className="mission-message"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                Build Paula's resistance to misinformation before Echo takes over their mind completely. 
              </motion.p>

              <motion.button
                className="btn-start"
                onClick={() => setStep(2)}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.6 }}
              >
                START
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* --- Context  --- */}
        {step === 2 && (
          <motion.div
            key="context"
            className="context-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            
            <div className="topbar">
              <div className="left">LIVES {Array.from({ length: 3 }).map((_, i) => (
                <LifeIcon key={i} index={i} />
              ))}</div>
              <div className="right score">SCORE 0</div>
            </div>

            
            <motion.h2
              className="context-title"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              CLIMATE CHANGE
            </motion.h2>

            <div className="context-layout">
              <motion.div
                className="context-textbox"
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <p>
                  Climate change is a change in the state of the climate that can be identified (e.g., by using statistical tests) by changes in the mean and/ or the variability of its properties and that persists for an extended period, typically decades or longer.
Climate change may be due to natural internal processes or external forcings such as modulations of the solar cycles, volcanic eruptions and persistent anthropogenic changes in the composition of the atmosphere or in land use (IPCC).
                </p>
              </motion.div>

              <motion.div
                className="context-image-wrapper"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Image
                  src="/images/characters/climate-change-illustration.png"
                  alt="Climate change illustration"
                  className="context-image"
                  width={200}
                  height={200}
                />
              </motion.div>
            </div>

            <motion.button
              className="btn-next"
              onClick={() => router.push('/quiz')}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              ›
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      
      {step === 0 && (
        <button className="btn-next" onClick={nextStep}>›</button>
      )}
    </div>
  )
}
