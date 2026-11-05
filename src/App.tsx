import { useEffect, useState } from 'react'
import './styles/landing.css'
import './styles/success.css'
import Footer from './components/Footer'
import SuccessScreen from './components/SuccessScreen'
import Logo from './assets/logo.png'
import SchoolImage from './assets/images/fachada.jpg'
import { IoLogoWhatsapp } from "react-icons/io"

const apiUrl = import.meta.env.VITE_API_URL as string | undefined

const webhookUrl = import.meta.env.VITE_WEBHOOK_URL

const formatWhatsApp = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

const normalizeWhatsapp = (value: string) => value.replace(/\D/g, '').slice(0, 11)

const getUtmData = () => {
  if (typeof window === 'undefined') {
    return {}
  }

  const currentUrl = new URL(window.location.href)
  const currentPage = currentUrl.origin
  const params = new URLSearchParams(currentUrl.search)
  const fields = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'utm_id',
    'utm_name',
    'utm_placement',
    'gclid',
  ] as const

  const utmData: Record<string, string> = {}

  for (const field of fields) {
    const value = params.get(field)

    if (value && value.trim()) {
      utmData[field] = value.trim()
    }
  }

  if (document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer)
      utmData.referrer = referrerUrl.origin
    } catch {
      utmData.referrer = document.referrer
    }
  }

  utmData.landing_page = currentPage

  return utmData
}

function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const [formData, setFormData] = useState({
    responsibleName: '',
    whatsapp: '',
    interestSeries: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname)

    window.addEventListener('popstate', handleLocationChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [])

  if (currentPath === '/sucesso') {
    return <SuccessScreen />
  }

  const fields = [
    {
      key: 'responsibleName',
      label: 'Nome do responsável',
      placeholder: 'Como podemos te chamar...',
      type: 'text',
      value: formData.responsibleName,
      maxLength: undefined,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      placeholder: '(11) 99999-9999',
      type: 'tel',
      value: formData.whatsapp,
      maxLength: 15,
    },
    {
      key: 'interestSeries',
      label: 'Série de interesse',
      placeholder: 'Ex.: 1º ano do ensino fundamental',
      type: 'text',
      value: formData.interestSeries,
      maxLength: undefined,
    },
  ] as const

  const isFormValid = () =>
    formData.responsibleName.trim().length >= 2 &&
    normalizeWhatsapp(formData.whatsapp).length >= 10 &&
    formData.interestSeries.trim().length >= 2

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'whatsapp' ? formatWhatsApp(value) : value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isFormValid()) {
      return
    }

    if (!apiUrl) {
      return
    }

    const payload = {
      responsible_name: formData.responsibleName.trim(),
      mobile_phone: normalizeWhatsapp(formData.whatsapp),
      interest: formData.interestSeries.trim(),
      ...getUtmData(),
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formData.responsibleName.trim(),
          phone: normalizeWhatsapp(formData.whatsapp),
          tags: ['landing-page'],
        }),
      });

      const result = await response.json().catch(() => null) as {
        success?: boolean
        message?: string
        lead?: unknown
        data?: unknown
        errors?: Record<string, string[]>
      } | null

      if (!response.ok || result?.success === false) {
        const fieldErrors = result?.errors
        const errorMessage = fieldErrors
          ? Object.values(fieldErrors)
              .flat()
              .join(' ')
          : result?.message || 'Não foi possível enviar os dados neste momento.'

        throw new Error(errorMessage)
      }

      const successMessage = typeof result?.message === 'string' && result.message.trim()
        ? result.message
        : 'Dados enviados com sucesso!'

      setSubmitMessage(successMessage)
      setFormData({
        responsibleName: '',
        whatsapp: '',
        interestSeries: '',
      })
      window.history.pushState({}, '', '/sucesso')
      setCurrentPath('/sucesso')
    } catch (error) {
      console.error('Erro ao enviar lead:', error)
      setSubmitMessage(error instanceof Error ? error.message : 'Não foi possível enviar os dados neste momento. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section className="relative items-center justify-center overflow-hidden px-2 pt-10 lg:flex lg:min-h-screen lg:justify-start lg:pt-0">
        <div className="relative z-20 w-full overflow-hidden px-6 sm:px-10 lg:w-1/2 lg:px-10 xl:px-16">
        
          <div className="relative mx-auto max-w-7xl">
            
            {/* Topo */}
            <div className="flex flex-wrap items-center gap-3 ">
              
              {/* Logo */}
              <div className="mr-3 flex items-center gap-2 text-white">
                <img src={Logo} alt="" />
              </div>

              {/* Ano */}
              <div className="flex h-[72px] w-[66px] items-center justify-center rounded-xl bg-[#FFE500] text-center text-[25px] font-black leading-[0.9] text-[#21458A]">
                <span>
                  20
                  <br />
                  27
                </span>
              </div>

              {/* Matrículas abertas */}
              <div className="flex h-[72px] items-center rounded-xl bg-[#279B48] px-5">
                <div className="leading-none">
                  <span className="block text-[19px] font-bold tracking-wide text-[#21458A]">
                    MATRÍCULAS
                  </span>

                  <span className="block text-[28px] font-extrabold leading-7 text-white">
                    ABERTAS
                  </span>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="mt-12 items-center grid gap-14">
              
              {/* Textos */}
              <div className="max-w-2xl text-center md:text-left">
                <h1 className="text-5xl font-medium leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-[72px]">
                  <span className="text-[#FFE500]">
                    A escola certa
                  </span>

                  <br />

                  <span className="text-white">
                    para sua família.
                  </span>
                </h1>
              </div>

              {/* Formulário */}
              <div className="relative lg:max-w-2xl">
                
                {/* Selo */}
                <div className="absolute -right-5 -top-20 z-10 sm:-top-10 sm:-right-2 flex h-28 w-28 rotate-[-8deg] items-center justify-center rounded-full bg-[#193D82] text-center shadow-xl ring-4 ring-white/10 sm:-right-4 sm:h-32 sm:w-32" id="agendar-visita">
                  <div>
                    <span className="block text-xl font-black leading-none text-white">
                      VAGAS
                    </span>

                    <span className="block text-sm font-bold leading-none text-[#FFE500]">
                      LIMITADAS
                    </span>
                  </div>
                </div>

                <div className="rounded-[30px] bg-white p-7 shadow-2xl sm:p-9">
                  
                  <h2 className="text-2xl font-light leading-tight text-[#21458A] sm:text-[28px]">
                    Preencha e{" "}
                    <strong className="font-bold">
                      agende uma visita
                    </strong>
                  </h2>

                  <form className="mt-7" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      {fields.map((field) => (
                        <div key={field.key}>
                          <label
                            htmlFor={field.key}
                            className="mb-2 block text-sm font-bold text-[#182A4A]"
                          >
                            {field.label}
                          </label>

                          <input
                            id={field.key}
                            type={field.type}
                            value={field.value}
                            maxLength={field.maxLength}
                            placeholder={field.placeholder}
                            required
                            onChange={(event) => handleInputChange(field.key, event.target.value)}
                            className="
                              h-[62px]
                              w-full
                              rounded-2xl
                              border
                              border-[#D9E2F2]
                              bg-[#F1F5FC]
                              px-5
                              text-base
                              text-[#182A4A]
                              outline-none
                              transition
                              placeholder:text-[#9EADCA]
                              focus:border-[#21458A]
                              focus:ring-2
                              focus:ring-[#21458A]/10
                            "
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting || !isFormValid()}
                        className="
                          flex
                          h-[62px]
                          flex-1
                          items-center
                          justify-center
                          gap-4
                          rounded-full
                          bg-[#FFE500]
                          text-lg
                          font-bold
                          text-[#162F63]
                          shadow-[0_8px_20px_rgba(255,229,0,0.18)]
                          transition
                          hover:-translate-y-0.5
                          hover:bg-[#ffea33]
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                          active:translate-y-0
                        "
                      >
                        <span>{isSubmitting ? 'Enviando...' : 'Enviar'}</span>

                        <span className="text-2xl font-light">
                          →
                        </span>
                      </button>
                    </div>

                    {submitMessage && (
                      <p className="mt-4 text-sm font-medium text-[#21458A]">{submitMessage}</p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <span className="hidden lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-1/2">
          <img src={SchoolImage} alt="Fachada da escola" className="h-full w-full object-cover lg:object-[center_90%]" />
        </span>

      </section>


      {/* float wpp button */}
      <a
        href="https://wa.me/5511972689163?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20as%20matr%C3%ADculas."
        target="_blank"
        rel="noopener noreferrer"
        className="text-3xl fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
      >
        <IoLogoWhatsapp/>
      </a>

      <Footer />
    </>
  )
}

export default App
