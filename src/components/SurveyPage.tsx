import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Lock, Unlock, Send, CheckCircle2, Calendar, ChevronRight } from 'lucide-react';
import Logo from '@/components/Logo';
import LikertScale from '@/components/LikertScale';
import { HOTEL_OPTIONS, SECTORS, VARIABLES, isSurveyOpenNow, getNextOpenPeriod, getCurrentPeriod } from '@/lib/constants';
import { insertRespuesta } from '@/lib/api';
import type { RespuestaEncuesta } from '@/lib/types';

type FormState = Record<string, number | string | null>;

export default function SurveyPage() {
  const navigate = useNavigate();
  const [overrideMode, setOverrideMode] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const surveyOpen = isSurveyOpenNow() || overrideMode || previewOpen;
  const currentPeriod = getCurrentPeriod();
  const nextPeriod = getNextOpenPeriod();

  const [step, setStep] = useState(-1); // -1 = pantalla de bienvenida (botón para la encuesta)
  const [metadata, setMetadata] = useState({
    hotel: '',
    sector: '',
    nombre_completo: '',
  });
  const [answers, setAnswers] = useState<FormState>({});
  const [comentarios, setComentarios] = useState('');
  const [beneficios, setBeneficios] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = VARIABLES.length + 1; // metadata + 4 variable sections
  const currentVariable = step > 0 && step <= VARIABLES.length ? VARIABLES[step - 1] : null;

  const allQuestionsAnswered = useMemo(() => {
    if (!currentVariable) return true;
    return currentVariable.questions.every((q) => answers[q.key] !== null && answers[q.key] !== undefined);
  }, [currentVariable, answers]);

  const canProceedMetadata = metadata.hotel !== '' && metadata.sector !== '';

  const handleAnswer = (key: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const payload: RespuestaEncuesta = {
      hotel: metadata.hotel,
      sector: metadata.sector,
      nombre_completo: metadata.nombre_completo || null,
      periodo: currentPeriod,
      ...answers,
      com_beneficios_deseados: beneficios || null,
      comentarios_observaciones: comentarios || null,
    } as RespuestaEncuesta;

    const { error: insertError } = await insertRespuesta(payload);
    setSubmitting(false);

    if (insertError) {
      setError('Hubo un problema al enviar tu encuesta. Por favor, inténtalo nuevamente.');
      return;
    }

    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center px-4">
        <div className="cs-card max-w-lg w-full p-8 text-center animate-slide-up">
          <Logo variant="circle" className="mb-6" />
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success-50">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
          </div>
          <h2 className="font-serif text-3xl text-charcoal-900 mb-3">¡Gracias por participar!</h2>
          <p className="text-neutral-elegant text-sm leading-relaxed mb-6">
            Tu respuesta se ha registrado de forma completamente anónima. Tu opinión
            es fundamental para construir un mejor entorno de trabajo en CasaSur Hotel Collection.
          </p>
          <p className="text-xs text-neutral-elegant mb-8">
            Periodo: <span className="font-medium text-charcoal-800">{currentPeriod}</span>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="cs-btn-primary"
          >
            Volver al inicio
          </button>
        </div>
        <footer className="mt-6 flex flex-col items-center">
          <Logo variant="horizontal" size="sm" className="justify-center" />
        </footer>
      </div>
    );
  }

  if (!surveyOpen) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center px-4">
        <div className="cs-card max-w-lg w-full p-8 text-center animate-fade-in">
          <Logo variant="circle" className="mb-6" />
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-200">
              <Calendar className="h-8 w-8 text-gold" />
            </div>
          </div>
          <h2 className="font-serif text-2xl text-charcoal-900 mb-3">
            La Encuesta de Clima Laboral se encuentra actualmente cerrada
          </h2>
          <p className="text-neutral-elegant text-sm leading-relaxed mb-2">
            La encuesta de CasaSur Hotel Collection está disponible durante los meses de
            <span className="font-medium text-charcoal-800"> enero</span> y
            <span className="font-medium text-charcoal-800"> julio</span>.
          </p>
          <p className="text-neutral-elegant text-sm leading-relaxed mb-8">
            Próxima apertura: <span className="font-medium text-gold">{nextPeriod}</span>
          </p>
        </div>
        <footer className="mt-6 flex flex-col items-center gap-3">
          <Logo variant="horizontal" size="sm" className="justify-center" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewOpen(true)}
              className="text-[11px] text-neutral-elegant/60 hover:text-gold transition-colors"
            >
              Vista previa (enero / julio)
            </button>
            <span className="text-neutral-border/60">·</span>
            <button
              onClick={() => setOverrideMode(true)}
              className="text-[11px] text-neutral-elegant/60 hover:text-gold transition-colors"
            >
              Modo de prueba
            </button>
            <span className="text-neutral-border/60">·</span>
            <button
              onClick={() => navigate({ to: '/admin' })}
              className="text-[11px] text-neutral-elegant/60 hover:text-gold transition-colors"
            >
              Acceso administrativo
            </button>
          </div>
        </footer>
      </div>
    );
  }

  const progress = Math.max(0, Math.round((step / totalSteps) * 100));

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-white border-b border-neutral-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo variant="circle" size="sm" />
          <div className="text-right">
            <p className="text-xs text-neutral-elegant">Clima Laboral</p>
            <p className="text-sm font-medium text-charcoal-800">{currentPeriod}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-neutral-border">
          <div
            className="h-full bg-gold transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {overrideMode && (
          <div className="mb-4 rounded-lg bg-warning-50 border border-warning/30 px-4 py-2 text-xs text-warning flex items-center gap-2">
            <Unlock className="h-3.5 w-3.5" />
            Modo de prueba activo — Las respuestas se registrarán en el periodo actual.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-danger-50 border border-danger/30 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Pantalla de bienvenida con botón para la encuesta */}
        {step === -1 && (
          <div className="animate-slide-up">
            <div className="cs-card max-w-xl mx-auto p-8 sm:p-10 text-center">
              <div className="mb-6 flex justify-center">
                <Logo variant="circle" size="md" />
              </div>
              <p className="text-xs uppercase tracking-widest text-gold mb-2">
                Clima Laboral · {currentPeriod}
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-900 mb-4">
                Encuesta de Clima Laboral
              </h1>
              <p className="text-sm text-neutral-elegant leading-relaxed max-w-md mx-auto mb-8">
                Tu opinión es anónima y confidencial. Nos ayuda a mejorar tu entorno
                de trabajo en CasaSur Hotel Collection. Toma menos de 5 minutos.
              </p>
              <button
                onClick={() => {
                  setStep(0);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="cs-btn-gold w-full sm:w-auto"
              >
                Comenzar encuesta
                <ChevronRight className="h-4 w-4" />
              </button>
              {previewOpen && !isSurveyOpenNow() && (
                <div className="mt-6 border-t border-neutral-border pt-4">
                  <button
                    onClick={() => {
                      setPreviewOpen(false);
                      setStep(-1);
                    }}
                    className="text-[11px] text-neutral-elegant/70 hover:text-charcoal-800 transition-colors"
                  >
                    Salir de la vista previa
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 0: Metadata */}
        {step === 0 && (
          <div className="animate-slide-up">
            <div className="mb-8 text-center">
              <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-900 mb-3">
                Encuesta de Clima Laboral
              </h1>
              <p className="text-sm text-neutral-elegant leading-relaxed max-w-md mx-auto">
                Tu opinión es anónima y confidencial. Nos ayuda a mejorar tu entorno
                de trabajo en CasaSur Hotel Collection.
              </p>
            </div>

            <div className="cs-card p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-charcoal-800 mb-2">
                  Hotel <span className="text-danger">*</span>
                </label>
                <select
                  value={metadata.hotel}
                  onChange={(e) => setMetadata((p) => ({ ...p, hotel: e.target.value }))}
                  className="cs-input"
                >
                  <option value="">Selecciona tu hotel...</option>
                  {HOTEL_OPTIONS.map((h) => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-800 mb-2">
                  Sector <span className="text-danger">*</span>
                </label>
                <select
                  value={metadata.sector}
                  onChange={(e) => setMetadata((p) => ({ ...p, sector: e.target.value }))}
                  className="cs-input"
                >
                  <option value="">Selecciona tu sector...</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-800 mb-2">
                  Nombre completo <span className="text-neutral-elegant font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={metadata.nombre_completo}
                  onChange={(e) => setMetadata((p) => ({ ...p, nombre_completo: e.target.value }))}
                  placeholder="Puedes dejar este campo en blanco..."
                  className="cs-input"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!canProceedMetadata}
                className="cs-btn-primary"
              >
                Continuar
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Steps 1-4: Variable sections */}
        {currentVariable && (
          <div className="animate-slide-up">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-gold mb-1">
                Sección {step} de {VARIABLES.length}
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-900">
                {currentVariable.label}
              </h2>
              <p className="text-sm text-neutral-elegant mt-1">
                Indica tu nivel de acuerdo con cada afirmación (1 = Muy en desacuerdo, 5 = Muy de acuerdo).
              </p>
            </div>

            <div className="space-y-4">
              {currentVariable.questions.map((q, idx) => (
                <div key={q.key} className="cs-card p-4 sm:p-5">
                  <p className="text-sm font-medium text-charcoal-800 mb-3">
                    {idx + 1}. {q.label}
                  </p>
                  <LikertScale
                    value={answers[q.key] as number ?? null}
                    onChange={(v) => handleAnswer(q.key, v)}
                  />
                </div>
              ))}

              {/* Free text fields on the last variable section */}
              {step === VARIABLES.length && (
                <div className="cs-card p-4 sm:p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-800 mb-2">
                      Beneficios que te gustaría tener
                    </label>
                    <textarea
                      value={beneficios}
                      onChange={(e) => setBeneficios(e.target.value)}
                      placeholder="Describe los beneficios que te gustaría que CasaSur ofreciera..."
                      className="cs-input min-h-[80px] resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-800 mb-2">
                      Comentarios u observaciones <span className="text-neutral-elegant font-normal">(opcional)</span>
                    </label>
                    <textarea
                      value={comentarios}
                      onChange={(e) => setComentarios(e.target.value)}
                      placeholder="Comparte cualquier comentario adicional..."
                      className="cs-input min-h-[80px] resize-y"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button onClick={handlePrev} className="cs-btn-secondary">
                Anterior
              </button>
              {step < VARIABLES.length ? (
                <button
                  onClick={handleNext}
                  disabled={!allQuestionsAnswered}
                  className="cs-btn-primary"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!allQuestionsAnswered || submitting}
                  className="cs-btn-gold"
                >
                  {submitting ? 'Enviando...' : 'Enviar encuesta'}
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-3xl mx-auto px-4 py-6 text-center">
        <Logo variant="horizontal" size="sm" className="justify-center mb-3" />
        <p className="text-xs text-neutral-elegant">
          CasaSur Hotel Collection — Encuesta de Clima Laboral {currentPeriod}
        </p>
        <button
          onClick={() => navigate({ to: '/admin' })}
          className="mt-2 text-xs text-neutral-elegant hover:text-gold transition-colors"
        >
          Acceso administrativo
        </button>
      </footer>
    </div>
  );
}
