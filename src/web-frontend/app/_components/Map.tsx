"use client"

export default function Map() {
  return (
    <div className="rounded-2xl overflow-hidden h-[85%] w-full shadow">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.123456789!2d121.133039!3d14.2388594!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd6267c6199515%3A0x7e9bfe0b59f2e78e!2sJ.A.U.+Medical+Clinic!5e0!3m2!1sen!2sph!4v1692870000000!5m2!1sen!2sph"
        width="100%"
        height="100%"
        className="border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  )
}
