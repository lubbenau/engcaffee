'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Bell } from 'lucide-react'

export default function KitchenAudio({ triggerPlay }) {
  const [audioEnabled, setAudioEnabled] = useState(false)
  const audioRef = useRef(null)

  // Prime the audio context and HTML5 Audio on user click
  const enableAudio = () => {
    setAudioEnabled(true)
    
    // Play a brief silence to unlock audio in current browser
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }).catch(e => {
        console.warn('Audio unlock warning:', e)
      })
    }
  }

  // Play audio whenever triggerPlay value changes (if it changes to true or a new timestamp)
  useEffect(() => {
    if (!triggerPlay || !audioEnabled) return

    const playAlert = async () => {
      let playedSuccessfully = false

      // 1. Try playing notification.mp3
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = 0
          await audioRef.current.play()
          playedSuccessfully = true
        } catch (e) {
          console.warn('HTML5 Audio playback failed, using fallback tone synthesizer:', e)
        }
      }

      // 2. Fallback: Synthesize elegant chimes using browser AudioContext
      if (!playedSuccessfully) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)()
          
          // Double chime (low-high)
          const playChime = (freq, delay, dur) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            
            osc.connect(gain)
            gain.connect(ctx.destination)
            
            osc.type = 'sine'
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
            
            gain.gain.setValueAtTime(0, ctx.currentTime + delay)
            gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + delay + 0.05)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur)
            
            osc.start(ctx.currentTime + delay)
            osc.stop(ctx.currentTime + delay + dur)
          }

          // First chime (A5 - 880Hz)
          playChime(880, 0, 0.4)
          // Second chime (C#6 - 1109Hz)
          playChime(1109, 0.15, 0.5)
        } catch (err) {
          console.error('AudioContext synthesis failed completely:', err)
        }
      }
    }

    playAlert()
  }, [triggerPlay, audioEnabled])

  return (
    <div className="print:hidden">
      {/* Invisible HTML5 Audio player pointing to public notification.mp3 */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      {/* Control panel widget to notify admin and enable audio alerts */}
      <div className={`p-4 rounded-3xl border flex items-center justify-between transition-all duration-300 ${
        audioEnabled
          ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
          : 'bg-amber-950/20 border-amber-500/20 text-amber-400'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            audioEnabled ? 'bg-emerald-500/10' : 'bg-amber-500/10'
          }`}>
            {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider">
              {audioEnabled ? '🔊 ALARM DAPUR AKTIF' : '🔇 ALARM DAPUR MATI'}
            </p>
            <p className="text-[10px] opacity-70 font-semibold mt-0.5">
              {audioEnabled
                ? 'Suara notifikasi menyala untuk pesanan baru.'
                : 'Ketuk aktifkan agar bunyi saat pesanan baru masuk.'}
            </p>
          </div>
        </div>

        {!audioEnabled && (
          <button
            onClick={enableAudio}
            className="bg-amber-400 hover:bg-amber-300 text-[#0B0F19] px-4 py-2 rounded-xl text-xs font-black border-none cursor-pointer transition-all shadow-sm"
          >
            AKTIFKAN 🔊
          </button>
        )}
      </div>
    </div>
  )
}
