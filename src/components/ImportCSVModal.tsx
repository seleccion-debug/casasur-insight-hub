import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { parseCSVToRespuestas } from '@/lib/csvParser';
import { bulkInsertRespuestas } from '@/lib/api';
import { getCurrentPeriod } from '@/lib/constants';
import type { CSVImportResult } from '@/lib/csvParser';

interface ImportCSVModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

type Phase = 'select' | 'preview' | 'importing' | 'success' | 'error';

export default function ImportCSVModal({ open, onClose, onImported }: ImportCSVModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('select');
  const [result, setResult] = useState<CSVImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const [defaultPeriodo, setDefaultPeriodo] = useState(getCurrentPeriod());

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setErrorMsg('No se pudo leer el archivo.');
        setPhase('error');
        return;
      }
      const parsed = parseCSVToRespuestas(text, defaultPeriodo);
      setResult(parsed);
      setPhase('preview');
    };
    reader.onerror = () => {
      setErrorMsg('Error al leer el archivo.');
      setPhase('error');
    };
    reader.readAsText(file, 'UTF-8');
  }, [defaultPeriodo]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      handleFile(file);
    } else {
      setErrorMsg('Por favor, selecciona un archivo CSV válido.');
      setPhase('error');
    }
  };

  const handleConfirmImport = async () => {
    if (!result || result.respuestas.length === 0) return;
    setPhase('importing');
    const { inserted, error } = await bulkInsertRespuestas(result.respuestas);
    if (error) {
      setErrorMsg(error);
      setPhase('error');
    } else {
      setImportedCount(inserted);
      setPhase('success');
      onImported();
    }
  };

  const handleReset = () => {
    setPhase('select');
    setResult(null);
    setErrorMsg('');
    setImportedCount(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const downloadTemplate = () => {
    const headers = [
      'Hotel',
      'Sector',
      'Nombre Completo',
      'Periodo',
      'Mi líder reconoce y valora mi trabajo.',
      'Recibo feedback claro y constructivo sobre mi desempeño.',
      'Mi líder distribuye las tareas de manera justa y objetiva.',
      'Me siento cómodo/a expresando mis ideas.',
      'Me siento satisfecho/a con mi desempeño.',
      'Estoy conforme con mi líder.',
      'La comunicación en el equipo es clara y transparente.',
      'Me siento satisfecho/a con el ambiente en mi lugar de trabajo.',
      'Me siento respetado/a por mis compañeros.',
      'Hay un buen nivel de colaboración en mi equipo.',
      'Hay un buen nivel de colaboración con otros departamentos.',
      'Siento que puedo plantear y resolver conflictos de manera constructiva dentro del equipo.',
      'He tenido oportunidades de capacitación en los últimos 6 meses.',
      'Siento que tengo posibilidades de aprender y crecer en este trabajo.',
      'Mis tareas son variadas y me presentan desafíos.',
      'Tengo acceso a alguien que me guía o apoya en mi desarrollo.',
      'Me siento motivado/a en mi trabajo.',
      'Conozco claramente los objetivos de mi puesto.',
      'Estoy satisfecho/a con mi experiencia laboral en general.',
      'Beneficios que te gustaría tener',
      'Comentarios / Observaciones',
    ];
    const sampleRow = [
      'Palermo', 'Front', '', 'Julio 2025',
      '4', '3', '4', '5', '4',
      '4', '3', '4', '5', '4', '3', '4',
      '3', '4', '4', '3', '4', '5',
      '4', '', '',
    ];
    const csv = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_encuesta_clima_casasur.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={handleClose}>
      <div
        className="cs-card max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-border px-6 py-4 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-gold" />
            <h2 className="font-serif text-xl text-charcoal-900">Importar CSV de Respuestas</h2>
          </div>
          <button onClick={handleClose} className="text-neutral-elegant hover:text-charcoal-900 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Select phase */}
          {phase === 'select' && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-elegant">
                Importa respuestas históricas desde un archivo CSV exportado de Google Forms.
                El sistema detecta automáticamente las columnas de hotel, sector y preguntas.
              </p>

              <div>
                <label className="block text-sm font-medium text-charcoal-800 mb-2">
                  Periodo por defecto
                </label>
                <input
                  type="text"
                  value={defaultPeriodo}
                  onChange={(e) => setDefaultPeriodo(e.target.value)}
                  placeholder="Ej: Julio 2025"
                  className="cs-input"
                />
                <p className="mt-1 text-xs text-neutral-elegant">
                  Se asignará este periodo a las respuestas que no tengan columna "Periodo" en el CSV.
                </p>
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-xl border-2 border-dashed border-neutral-border bg-cream-50 px-6 py-10 text-center transition-all hover:border-gold hover:bg-cream-100"
              >
                <FileText className="mx-auto h-10 w-10 text-gold mb-3" />
                <p className="text-sm font-medium text-charcoal-800">
                  Arrastra un archivo CSV aquí o haz clic para seleccionar
                </p>
                <p className="mt-1 text-xs text-neutral-elegant">
                  Formato: CSV con encabezados (exportado de Google Forms)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>

              <div className="flex items-center justify-between border-t border-neutral-border pt-4">
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-elegant hover:text-gold transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar plantilla CSV de ejemplo
                </button>
              </div>
            </div>
          )}

          {/* Preview phase */}
          {phase === 'preview' && result && (
            <div className="space-y-4">
              {result.errors.length > 0 && (
                <div className="rounded-lg bg-warning-50 border border-warning/30 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-warning">
                        {result.errors.length} advertencia(s)
                      </p>
                      <ul className="mt-1 space-y-0.5 max-h-32 overflow-y-auto">
                        {result.errors.slice(0, 10).map((err, idx) => (
                          <li key={idx} className="text-xs text-warning">{err}</li>
                        ))}
                        {result.errors.length > 10 && (
                          <li className="text-xs text-warning">... y {result.errors.length - 10} más</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-cream-100 px-4 py-3 text-center">
                  <p className="text-xs text-neutral-elegant uppercase tracking-wider">Filas</p>
                  <p className="font-serif text-2xl text-charcoal-900">{result.totalRows}</p>
                </div>
                <div className="rounded-lg bg-success-50 px-4 py-3 text-center">
                  <p className="text-xs text-success uppercase tracking-wider">A importar</p>
                  <p className="font-serif text-2xl text-success">{result.respuestas.length}</p>
                </div>
                <div className="rounded-lg bg-danger-50 px-4 py-3 text-center">
                  <p className="text-xs text-danger uppercase tracking-wider">Omitidas</p>
                  <p className="font-serif text-2xl text-danger">{result.skipped}</p>
                </div>
              </div>

              {result.respuestas.length > 0 && (
                <div className="rounded-lg border border-neutral-border overflow-hidden">
                  <div className="bg-cream-100 px-4 py-2 border-b border-neutral-border">
                    <p className="text-xs font-medium text-charcoal-800">Vista previa de respuestas</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-cream-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-neutral-elegant">Hotel</th>
                          <th className="px-3 py-2 text-left font-medium text-neutral-elegant">Sector</th>
                          <th className="px-3 py-2 text-left font-medium text-neutral-elegant">Periodo</th>
                          <th className="px-3 py-2 text-left font-medium text-neutral-elegant">Preguntas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.respuestas.slice(0, 8).map((r, idx) => {
                          const scores = Object.entries(r).filter(
                            ([k, v]) =>
                              k.startsWith('val_') || k.startsWith('rel_') || k.startsWith('mot_') || k.startsWith('com_')
                          );
                          const answered = scores.filter(([, v]) => v !== null && v !== undefined).length;
                          return (
                            <tr key={idx} className="border-t border-neutral-border">
                              <td className="px-3 py-2 text-charcoal-800">{r.hotel}</td>
                              <td className="px-3 py-2 text-charcoal-800">{r.sector}</td>
                              <td className="px-3 py-2 text-charcoal-800">{r.periodo}</td>
                              <td className="px-3 py-2 text-neutral-elegant">{answered}/19</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {result.respuestas.length > 8 && (
                      <p className="px-3 py-2 text-xs text-neutral-elegant bg-cream-50 border-t border-neutral-border">
                        ... y {result.respuestas.length - 8} respuestas más
                      </p>
                    )}
                  </div>
                </div>
              )}

              {result.respuestas.length === 0 ? (
                <div className="rounded-lg bg-danger-50 border border-danger/30 px-4 py-3 text-center">
                  <p className="text-sm text-danger">
                    No se encontraron respuestas válidas para importar. Revisa el formato del CSV.
                  </p>
                </div>
              ) : (
                <div className="flex justify-end gap-3">
                  <button onClick={handleReset} className="cs-btn-secondary">
                    Cancelar
                  </button>
                  <button onClick={handleConfirmImport} className="cs-btn-gold">
                    <Upload className="h-4 w-4" />
                    Importar {result.respuestas.length} respuestas
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Importing phase */}
          {phase === 'importing' && (
            <div className="py-12 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-neutral-border border-t-gold" />
              <p className="mt-4 text-sm text-neutral-elegant">Importando respuestas a la base de datos...</p>
            </div>
          )}

          {/* Success phase */}
          {phase === 'success' && (
            <div className="py-8 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-50 mb-4">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-serif text-2xl text-charcoal-900 mb-2">¡Importación exitosa!</h3>
              <p className="text-sm text-neutral-elegant mb-6">
                Se importaron <span className="font-medium text-success">{importedCount}</span> respuestas
                a la base de datos. Los resultados estarán disponibles en el dashboard.
              </p>
              <button onClick={handleClose} className="cs-btn-primary">
                Cerrar
              </button>
            </div>
          )}

          {/* Error phase */}
          {phase === 'error' && (
            <div className="py-8 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 mb-4">
                <AlertCircle className="h-8 w-8 text-danger" />
              </div>
              <h3 className="font-serif text-2xl text-charcoal-900 mb-2">Error</h3>
              <p className="text-sm text-danger mb-6 max-w-md mx-auto">{errorMsg}</p>
              <button onClick={handleReset} className="cs-btn-secondary">
                Intentar nuevamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
