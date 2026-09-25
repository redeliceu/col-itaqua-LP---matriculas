import { useEffect, useState } from 'react'
import './styles/landing.css'
import './styles/success.css'
import Footer from './components/Footer'
import SuccessScreen from './components/SuccessScreen'
import ChildImage from './assets/images/child.png'
import Logo from './assets/logo.png'
import SchoolImage from './assets/images/school.jpg'
import SchoolImage2 from './assets/images/school2.jpg'
import JudoImage from './assets/images/judo.jpg'
import ClassImage from './assets/images/class.jpg'
import Child2Image from './assets/images/child2.jpg'
import Child3Image from './assets/images/child3.jpg'
import StudentImage from './assets/images/student.jpg'
import Student2Image from './assets/images/student2.jpg'
import GardenImage from './assets/images/horta.jpg'
import BalleteImage from './assets/images/bale.png'
import VilaKidsImage from './assets/images/vila-kids.png'
import QuadraImage from './assets/images/quadra.png'
import { IoLogoWhatsapp } from "react-icons/io"


const features = [
  {
    title: '34 anos de história',
    description: 'Tradição e experiência em Itaquaquecetuba.',
    image:
      SchoolImage,
  },
  {
    title: '10 mil m² de área verde',
    description: 'Quadra, horta e espaço aberto: aula que sai da sala de aula.',
    image:
      SchoolImage2,
  },
  {
    title: 'Formação completa',
    description: 'Balé, judô, libras e inglês, sem precisar pagar escolinha à parte. ',
    image:
      JudoImage,
  },
  {
    title: 'Acompanhamento de perto',
    description: 'Equipe que conhece seu filho pelo nome.',
    image:
      ClassImage,
  },
]

const slides = [
  { title: 'Área verde', image: SchoolImage2 },
  { title: 'Quadra', image: QuadraImage },
  { title: 'Horta', image: GardenImage },
  { title: 'Villa Kids', image: VilaKidsImage },
  { title: 'Balé', image: BalleteImage },
  { title: 'Judô', image: JudoImage },
  { title: 'Libras', image: ClassImage },
  { title: 'Inglês', image: Student2Image },
]

const faqItems = [
  {
    question: 'Quais séries o colégio atende?',
    answer: 'Atendemos desde a educação infantil até o ensino médio, com uma proposta completa de formação e acolhimento para cada etapa escolar.',
  },
  {
    question: 'Qual o período? Tem integral?',
    answer: 'Sim. Oferecemos turnos e opções de integral para atender as necessidades da sua família, com acompanhamento pedagógico e atividades complementares.',
  },
  {
    question: 'Como funcionam a mensalidade e as condições pra 2027?',
    answer: 'As condições e valores são divulgados conforme o ciclo letivo e podem ser conversados diretamente com nossa equipe durante a visita.',
  },
  {
    question: 'Meu filho está em outra escola. Dá pra trocar agora?',
    answer: 'Sim. O processo de transferência é bem simples e nosso time pode orientar você passo a passo sobre matrícula, documentação e adaptação.',
  },
  {
    question: 'Onde fica e tem transporte?',
    answer: 'Estamos em Itaquaquecetuba e também contamos com informações sobre acesso e transporte escolar. Fale com a nossa equipe para mais detalhes.',
  },
]

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
  const [activeIndex, setActiveIndex] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  const [currentStep, setCurrentStep] = useState(0)
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const [formData, setFormData] = useState({
    responsibleName: '',
    whatsapp: '',
    interestSeries: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    const handleLocationChange = () => setCurrentPath(window.location.pathname)

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('popstate', handleLocationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [])

  if (currentPath === '/sucesso') {
    return <SuccessScreen />
  }

  const visibleSlides = isMobile
    ? [slides[activeIndex]]
    : [
        slides[(activeIndex - 1 + slides.length) % slides.length],
        slides[activeIndex],
        slides[(activeIndex + 1) % slides.length],
      ]

  const steps = [
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

  const isCurrentStepValid = () => {
    const currentField = steps[currentStep].key

    if (currentField === 'responsibleName') {
      return formData.responsibleName.trim().length >= 2
    }

    if (currentField === 'whatsapp') {
      return normalizeWhatsapp(formData.whatsapp).length >= 10
    }

    return formData.interestSeries.trim().length >= 2
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'whatsapp' ? formatWhatsApp(value) : value,
    }))
  }

  const handleNextStep = () => {
    if (!isCurrentStepValid()) {
      return
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isCurrentStepValid()) {
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
      setCurrentStep(0)
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
      <section className="px-2 pt-10 xl:pt-0 xl:flex items-center justify-center relative overflow-hidden">
        <div className="min-[1280px]:absolute xl:block left-10 z-20 overflow-hidden px-6 sm:px-10 lg:px-16">
        
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

                <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl">
                  Um colégio que une{" "}
                  <strong className="font-bold text-white">
                    acolhimento, ensino de qualidade
                  </strong>{" "}
                  e uma estrutura completa para{" "}
                  <strong className="font-bold text-white">
                    acompanhar seu filho em cada fase.
                  </strong>
                </p>
              </div>

              {/* Formulário */}
              <div className="relative">
                
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
                    <div className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-[#21458A]/70">
                      <span>Etapa {currentStep + 1}</span>
                      <span>{currentStep + 1}/{steps.length}</span>
                    </div>

                    <label
                      htmlFor={steps[currentStep].key}
                      className="mb-2 block text-sm font-bold text-[#182A4A]"
                    >
                      {steps[currentStep].label}
                    </label>

                    <input
                      id={steps[currentStep].key}
                      type={steps[currentStep].type}
                      value={steps[currentStep].value}
                      maxLength={steps[currentStep].maxLength}
                      placeholder={steps[currentStep].placeholder}
                      onChange={(event) => handleInputChange(steps[currentStep].key as keyof typeof formData, event.target.value)}
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

                    <div className="mt-5 flex gap-3">
                      {currentStep > 0 && (
                        <button
                          type="button"
                          onClick={handlePreviousStep}
                          className="flex h-[62px] flex-1 items-center justify-center rounded-full border border-[#D9E2F2] bg-white text-lg font-bold text-[#162F63] transition hover:bg-[#F4F8FF]"
                        >
                          Voltar
                        </button>
                      )}

                      {currentStep < steps.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          disabled={!isCurrentStepValid()}
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
                          <span>Avançar</span>

                          <span className="text-2xl font-light">
                            →
                          </span>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting || !isCurrentStepValid()}
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
                      )}
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

        <span className="min-[1280px]:absolute min-[1280px]:right-[-200px] min-[1670px]:right-0 z-10">
          <img src={ChildImage} alt="Child" className='xl:h-screen object-cover'/>
        </span>

      </section>


      {/* faixa */}
      <div className="bg-[#0B1E3F] py-5">
        <div className="mx-auto flex justify-around max-w-screen text-[0.60rem] sm:text-xs font-medium tracking-[0.25em] text-white">
          <div className="text-center py-5 sm:flex-1 ml-5 sm:ml-0">
            INFANTIL
          </div>

          <div className="text-center border-x px-[7%] sm:px-none sm:flex-1 border-[#344565] py-5">
            FUND. I e II
          </div>

          <div className="text-center border-[#344565] py-5 sm:flex-1 pr-5 md:pr-0">
            ENSINO MÉDIO
          </div>
        </div>
      </div>

      {/* diferenciais */}
      <section className="diff-section relative overflow-hidden bg-[#F3F3F1] px-4 py-20 sm:px-6 lg:px-8" id="diferenciais">
        <div className="diff-grid absolute inset-0 opacity-70" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="flex justify-center">
            <span className="inline-flex rounded-xl bg-[#FFE500] px-5 py-2 text-sm font-black uppercase tracking-[0.1em] text-[#0E2F67] shadow-sm">
              Diferenciais
            </span>
          </div>

          <h2 className="mt-7 text-center text-3xl font-black leading-tight tracking-[-0.05em] text-[#0E2F67] sm:text-5xl lg:text-[64px]">
            Tudo o que ele precisa para crescer.
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-[28px] bg-[#eaf1ff]/80 shadow-[0_10px_30px_rgba(19,50,113,0.08)] ring-1 ring-[#e3ecff] backdrop-blur-sm"
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="h-40 w-full rounded-t-[22px] object-cover"
                />

                <div className="mt-5 text-[#0E2F67] p-4">
                  <h3 className="text-2xl font-black leading-snug tracking-[-0.05em] whitespace-pre-line">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-base leading-relaxed text-[#21458A]/80 whitespace-pre-line">
                    {feature.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <a href="#">
              <button
                type="button"
                className="inline-flex items-center gap-4 rounded-full bg-[#0E2F67] px-9 py-4 text-lg font-bold text-white shadow-[0_18px_35px_rgba(14,47,103,0.25)] transition hover:-translate-y-0.5 hover:bg-[#123d87]"
              >
                Quero agendar uma visita
                <span className="text-2xl leading-none">→</span>
              </button>
            </a>
          </div>
        </div>

        <div className="pointer-events-none absolute -bottom-14 right-0 h-52 w-52 rounded-full bg-[#F8D2D0]/80 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-[-5%] h-40 w-40 rounded-full bg-[#CBE7E0]/80 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 right-[8%] h-28 w-28 rounded-full bg-[#CFE6FF]/80 blur-2xl" />
      </section>

      {/* proposta */}
      <section className="proposal-section relative overflow-hidden bg-[#0B2F6A] px-4 py-20 text-white sm:px-6 lg:px-10">
        <div className="proposal-badge absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
          <span className="block h-10 w-10 rounded-full bg-[#FFE500] shadow-[0_6px_16px_rgba(255,229,0,0.35)]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.08fr_1fr]">
          <div className="max-w-[570px]">
            <span className="inline-flex rounded-full bg-[#FFE500] px-5 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#102E6B] shadow-sm">
              Proposta
            </span>

            <h2 className="mt-7 text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl lg:text-[66px]">
              <span className="block text-[#FFE500]">Cuidado para acolher.</span>
              <span className="block">Ensino para preparar.</span>
            </h2>

            <div className="mt-8 space-y-4 text-[17px] leading-relaxed text-white/90 sm:text-[22px]">
              <div className="flex items-center gap-3">
                <span className="h-5 w-1 bg-[#FFE500]" />
                <p className="m-0">Crescer é muito mais do que passar de ano.</p>
              </div>

              <p className="max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                É desenvolver autonomia, criar vínculos, descobrir novos interesses e estar preparado para os próximos desafios.
              </p>

              <p className="max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                No Colégio Itaqua, cada aluno encontra espaço para aprender e desenvolver todo o seu potencial, com acompanhamento próximo e uma formação acadêmica consistente.
              </p>
            </div>

            <a href="#">
              <button
                type="button"
                className="mt-10 inline-flex items-center gap-4 rounded-full bg-[#FFE500] px-8 py-4 text-lg font-black text-[#102E6B] shadow-[0_12px_30px_rgba(255,229,0,0.3)] transition hover:-translate-y-0.5 hover:bg-[#ffe93a]"
              >
                Quero conhecer a escola
                <span className="text-2xl leading-none">→</span>
              </button>
            </a>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="proposal-collage">
              <div className="proposal-card proposal-card-main">
                <img src={Child2Image} alt="Aluno sorrindo em sala de aula" />
              </div>

              <div className="proposal-card proposal-card-top">
                <img src={StudentImage} alt="Aluno em atividade escolar" />
              </div>

              <div className="proposal-card proposal-card-bottom">
                <img src={Child3Image} alt="Criança em atividade externa" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* carousel */}
      <section className="relative overflow-hidden bg-[#f4f4f2] px-4 py-16 sm:px-6 lg:px-8" id="estrutura-experiencias">
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-center">
            <span className="inline-flex rounded-full bg-[#FFE500] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#102E6B] shadow-sm">
              Estrutura & Experiências
            </span>
          </div>

          <h2 className="mt-8 text-center text-4xl font-medium leading-[0.95] tracking-[-0.05em] text-[#102E6B] sm:text-5xl lg:text-[64px]">
            Aqui, tem espaço para crescer.
          </h2>

          <p className="mt-4 text-center text-base text-[#1e3e75] sm:text-xl">
            O aprendizado também acontece fora da sala de aula.
          </p>

          <div className="mt-12 flex items-center justify-center gap-4 md:gap-6">
            <button
              type="button"
              aria-label="Voltar"
              onClick={() => setActiveIndex((current) => (current - 1 + slides.length) % slides.length)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1C5CA8] text-2xl font-light text-white shadow-[0_12px_24px_rgba(28,92,168,0.25)] transition hover:-translate-y-0.5 md:h-16 md:w-16"
            >
              ←
            </button>

            <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
              {visibleSlides.map((slide, index) => {
                const isCenter = isMobile ? true : index === 1

                return (
                  <article
                    key={`${slide.title}-${index}`}
                    className={`carousel-card ${isCenter ? 'carousel-card--center' : 'carousel-card--side'} relative overflow-hidden rounded-[30px] shadow-[0_20px_40px_rgba(1,18,45,0.18)]`}
                  >
                    <img src={slide.image} alt={slide.title} className="h-[260px] w-full object-cover sm:h-[320px] md:h-[420px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
                      <span className="text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">{slide.title}</span>
                    </div>
                  </article>
                )
              })}
            </div>

            <button
              type="button"
              aria-label="Próximo"
              onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1C5CA8] text-2xl font-light text-white shadow-[0_12px_24px_rgba(28,92,168,0.25)] transition hover:-translate-y-0.5 md:h-16 md:w-16"
            >
              →
            </button>
          </div>

          <div className="mt-12 flex justify-center">
            <a href="#">
              <button
                type="button"
                className="inline-flex items-center gap-4 rounded-full bg-[#1C5CA8] px-9 py-4 text-lg font-bold text-white shadow-[0_18px_35px_rgba(28,92,168,0.22)] transition hover:-translate-y-0.5 hover:bg-[#184d9c]"
              >
                Quero agendar uma visita
                <span className="text-2xl leading-none">→</span>
              </button>
            </a>
          </div>
        </div>
      </section>

      <section className="location-section relative overflow-hidden bg-[#F4F4F2] px-4 pb-20 sm:px-6 lg:px-8" id="localizacao">
        <div className="location-scroll-indicator">
          <span>↓</span>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center mt-16">
          <div className="flex justify-center">
            <span className="inline-flex rounded-full bg-[#FFE500] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#102E6B] shadow-sm">
              Localização
            </span>
          </div>

          <h2 className="mt-8 text-2xl md:text-4xl font-black leading-[0.95] tracking-[-0.05em] text-[#FFE500] sm:text-5xl lg:text-[40px]">
            A escola certa <span className="text-[#102E6B]"> também precisa fazer sentido para sua família.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-[#1B3F7A] sm:text-xl">
            Venha conhecer nossos espaços, conversar com a equipe e descobrir de perto tudo o que o Colégio Itaqua pode oferecer ao seu filho.
          </p>

          <div className="location-map-wrap mt-10">
            <div className="location-map-card">
              <iframe
                title="Mapa do Colégio Itaqua"
                src="https://www.google.com/maps?q=Av.%20Italo%20Adami%2C%201386%20-%20Vila%20Zeferina%2C%20Itaquaquecetuba%20-%20SP%2C%2008574-020&z=15&output=embed"
                loading="lazy"
                className="location-map-iframe"
                referrerPolicy="no-referrer-when-downgrade"
              />

              <div className="location-address-bar">
                Av. Italo Adami, 1386 - Vila Zeferina, Itaquaquecetuba - SP, 08574-020
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <a href="#">
              <button
                type="button"
                className="inline-flex items-center gap-4 rounded-full bg-[#FFE500] px-8 py-4 text-lg font-black text-[#102E6B] shadow-[0_14px_30px_rgba(255,229,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#ffe93a]"
              >
                Agendar uma visita
                <span className="text-2xl leading-none">→</span>
              </button>
            </a>
          </div>
        </div>
      </section>

      <div className="divisor flex justify-center text-center">
        <div className="bg-black/50 w-full h-full py-[20vh] text-white">
          <p className='font-bold'>AQUI, TEM ESPAÇO PARA CRESCER.</p>
          <h1 className='text-5xl sm:text-6xl lg:text-[72px]'>
            <span className='text-[#FFE500] font-bold'>A escola certa </span>
            <br />
            para sua família
          </h1>
        </div>
      </div>

      <section className="faq-section" id="faq">
        <div className="faq-wrap">
          <div className="faq-left">
            <span className="faq-badge">FAQ</span>
            <p className='text-3xl md:text-5xl font-bold text-[#102E6B]'>Perguntas que toda mãe e pai faz</p>
            <a href="#">
              <button type="button" className="faq-cta">
                Agendar uma visita
                <span>→</span>
              </button>
            </a>
          </div>

          <div className="faq-right">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index

              return (
                <div key={item.question} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>
                    <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                  </button>

                  {isOpen && <p className="faq-answer">{item.answer}</p>}
                </div>
              )
            })}
          </div>
        </div>
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
