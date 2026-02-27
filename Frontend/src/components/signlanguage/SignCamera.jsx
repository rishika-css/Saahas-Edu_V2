import { useRef, useEffect } from 'react'

export default function SignCamera() {
  const videoRef = useRef(null)

  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video: true }).then(stream => {
      if (videoRef.current) videoRef.current.srcObject = stream
    }).catch(() => {})
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video">
      <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
        LIVE
      </div>
    </div>
  )
}