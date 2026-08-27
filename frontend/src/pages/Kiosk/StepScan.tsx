import React, { useState } from 'react';
import { 
  Upload, FileText, Sparkles, CheckCircle2, AlertTriangle, 
  ArrowRight, ArrowLeft, Plus, Edit2, Check, Eye, Trash2, 
  AlertCircle, ShieldCheck, RefreshCw, FileSearch, Save, X 
} from 'lucide-react';
import { 
  LanguageCode, PatientSession, PriorInvestigation 
} from '../../types';
import { translations } from '../../utils/i18n';
import { AbnormalBadge } from '../../components/AbnormalBadge';

interface StepScanProps {
  session: PatientSession;
  currentLang: LanguageCode;
  onUploadFile: (file: File) => Promise<void>;
  onLoadSample: (sampleId: string) => Promise<void>;
  onCorrectDoc: (docId: string, extracted: any) => Promise<void>;
  onProceedToSummary: () => void;
  onBackToConverse: () => void;
  isLoading: boolean;
}

export const StepScan: React.FC<StepScanProps> = ({
  session,
  currentLang,
  onUploadFile,
  onLoadSample,
  onCorrectDoc,
  onProceedToSummary,
  onBackToConverse,
  isLoading,
}) => {
  const t = translations[currentLang] || translations.en;

  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    session.priorInvestigations.length > 0 ? session.priorInvestigations[0].id : null
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const sampleOptions = [
    {
      id: 'sample_lab_report',
      title: '1. Printed Lab Report (Lipid & Blood Sugar)',
      type: 'Lab Report',
      desc: 'Shows high Fasting Glucose (148 mg/dL) & elevated LDL Cholesterol (164 mg/dL)',
      badge: 'High Anomaly',
    },
    {
      id: 'sample_printed_rx',
      title: '2. Printed Prescription (Cardiology OPD)',
      type: 'Printed Rx',
      desc: 'Anti-hypertensive & anti-diabetic medications (Telmisartan, Metformin, Atorvastatin)',
      badge: 'Clear Print',
    },
    {
      id: 'sample_handwritten_rx',
      title: "3. Handwritten Doctor's Rx (General Medicine)",
      type: 'Handwritten',
      desc: 'Cursive doctor handwriting (Amoxicillin, Pan-40, Dolo 650) — Tests review state',
      badge: 'Needs Review',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  const handleStartEdit = (doc: PriorInvestigation) => {
    setEditFormData(JSON.parse(JSON.stringify(doc.extracted || {})));
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!activeDoc) return;
    await onCorrectDoc(activeDoc.id, editFormData);
    setIsEditing(false);
  };

  const activeDoc = session.priorInvestigations.find(
    (d) => d.id === (selectedDocId || (session.priorInvestigations[0]?.id))
  ) || session.priorInvestigations[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Step Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200">
        <div className="flex items-center space-x-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Step 3 of 4 • Document Capture & OCR</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t.scanTitle}
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Attach previous doctor prescriptions, discharge summaries, or laboratory test reports. Our Vision-AI transcribes and flags abnormalities.
        </p>

        {/* Dual Path Chooser: Real Upload vs Sample Demo Document */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          
          {/* Path A: Real Document Upload */}
          <div className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50 rounded-2xl p-6 flex flex-col justify-between transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t.scanRealUpload}</h3>
              <p className="text-xs text-slate-600">
                Upload a photo or scanned image from camera/device (PNG, JPG, JPEG, WEBP).
              </p>
            </div>
            <label className="mt-4 inline-flex items-center justify-center px-4 py-3 bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold rounded-xl cursor-pointer shadow-md transition-all min-h-[48px]">
              <Upload className="w-4 h-4 mr-2" />
              <span>Choose Document Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="hidden"
              />
            </label>
          </div>

          {/* Path B: Try Sample Document (Demo Mode) */}
          <div className="border-2 border-slate-200 bg-slate-50 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-md">
                <FileSearch className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t.scanSampleMode}</h3>
                <p className="text-xs text-slate-600">
                  Select a bundled sample image to test the genuine extraction pipeline without physical paperwork:
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {sampleOptions.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  disabled={isLoading}
                  onClick={() => onLoadSample(s.id)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-300 hover:border-teal-600 hover:bg-white bg-white/70 text-xs font-semibold text-slate-800 transition-all flex items-center justify-between group disabled:opacity-50 min-h-[42px]"
                >
                  <div className="truncate pr-2">
                    <span className="text-slate-900 font-bold block">{s.title}</span>
                    <span className="text-[11px] text-slate-500 font-normal">{s.desc}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 group-hover:bg-teal-100 text-slate-700 group-hover:text-teal-900 shrink-0">
                    Load
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Document Timeline Strip */}
      {session.priorInvestigations.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Attached Medical Records ({session.priorInvestigations.length})
            </h4>
            <span className="text-xs text-slate-400">Click a record to view details</span>
          </div>

          <div className="flex space-x-3 overflow-x-auto pb-2">
            {session.priorInvestigations.map((doc, idx) => (
              <button
                type="button"
                key={doc.id}
                onClick={() => {
                  setSelectedDocId(doc.id);
                  setIsEditing(false);
                }}
                className={`p-3.5 rounded-xl border-2 text-left shrink-0 w-64 transition-all ${
                  (activeDoc?.id === doc.id)
                    ? 'border-teal-600 bg-teal-50/70 shadow-md'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-teal-800 truncate">Doc #{idx + 1}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    doc.confidence >= 0.85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {Math.round(doc.confidence * 100)}% Conf
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">{doc.document}</div>
                {doc.flag && (
                  <div className="text-[10px] text-rose-600 font-semibold truncate mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    <span>{doc.flag}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Document Details & Extraction Card */}
      {activeDoc && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Card Header with Confidence Indicator & Edit Button */}
          <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <h3 className="text-base font-bold text-white">{activeDoc.document}</h3>
              </div>
              <p className="text-xs text-slate-400">
                Scanned on: {activeDoc.timestamp} • Type: <span className="capitalize">{activeDoc.documentType.replace(/_/g, ' ')}</span>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Confidence Meter */}
              <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400 font-medium">Confidence:</span>
                <span className={`text-xs font-bold ${
                  activeDoc.confidence >= 0.85 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {Math.round(activeDoc.confidence * 100)}%
                </span>
              </div>

              {/* Edit Fields Button */}
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => handleStartEdit(activeDoc)}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-xs font-bold text-white rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Fields</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Edits</span>
                </button>
              )}

              {activeDoc.imageUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewImage(activeDoc.imageUrl || null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Original</span>
                </button>
              )}
            </div>
          </div>

          {/* Low Confidence Notice */}
          {activeDoc.confidence < 0.75 && (
            <div className="bg-amber-50 border-b border-amber-200 p-4 flex items-start space-x-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Moderate extraction confidence ({Math.round(activeDoc.confidence * 100)}%)</p>
                <p>{t.needsReviewNote} Click "Edit Fields" above to correct any handwritten medications or lab numbers.</p>
              </div>
            </div>
          )}

          {/* Card Body: Structured Findings or Edit Mode */}
          <div className="p-6 space-y-6">
            
            {isEditing ? (
              /* Inline Editable Form for Extracted Fields */
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-xs font-bold uppercase text-slate-800">
                    Manual Correction Editor
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-slate-500 hover:text-slate-800 text-xs flex items-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>

                {/* Lab Investigations Editor */}
                {editFormData.investigations && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Lab Investigations:</label>
                    {editFormData.investigations.map((item: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                        <input
                          type="text"
                          value={item.test || ''}
                          onChange={(e) => {
                            const updated = [...editFormData.investigations];
                            updated[idx].test = e.target.value;
                            setEditFormData({ ...editFormData, investigations: updated });
                          }}
                          placeholder="Test Name"
                          className="px-2 py-1 border rounded text-xs"
                        />
                        <input
                          type="text"
                          value={item.value || ''}
                          onChange={(e) => {
                            const updated = [...editFormData.investigations];
                            updated[idx].value = e.target.value;
                            setEditFormData({ ...editFormData, investigations: updated });
                          }}
                          placeholder="Observed Value"
                          className="px-2 py-1 border rounded text-xs font-mono font-bold"
                        />
                        <input
                          type="text"
                          value={item.unit || ''}
                          onChange={(e) => {
                            const updated = [...editFormData.investigations];
                            updated[idx].unit = e.target.value;
                            setEditFormData({ ...editFormData, investigations: updated });
                          }}
                          placeholder="Unit"
                          className="px-2 py-1 border rounded text-xs"
                        />
                        <select
                          value={item.flag || 'NORMAL'}
                          onChange={(e) => {
                            const updated = [...editFormData.investigations];
                            updated[idx].flag = e.target.value;
                            setEditFormData({ ...editFormData, investigations: updated });
                          }}
                          className="px-2 py-1 border rounded text-xs"
                        >
                          <option value="NORMAL">Normal</option>
                          <option value="HIGH">High (Abnormal)</option>
                          <option value="LOW">Low (Abnormal)</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {/* Prescription Medications Editor */}
                {editFormData.medications && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Prescription Medications:</label>
                    {editFormData.medications.map((m: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                        <input
                          type="text"
                          value={m.name || ''}
                          onChange={(e) => {
                            const updated = [...editFormData.medications];
                            updated[idx].name = e.target.value;
                            setEditFormData({ ...editFormData, medications: updated });
                          }}
                          placeholder="Medicine Name"
                          className="px-2 py-1 border rounded text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={m.dosage || ''}
                          onChange={(e) => {
                            const updated = [...editFormData.medications];
                            updated[idx].dosage = e.target.value;
                            setEditFormData({ ...editFormData, medications: updated });
                          }}
                          placeholder="Dosage (e.g. 1 tab)"
                          className="px-2 py-1 border rounded text-xs"
                        />
                        <input
                          type="text"
                          value={m.frequency || ''}
                          onChange={(e) => {
                            const updated = [...editFormData.medications];
                            updated[idx].frequency = e.target.value;
                            setEditFormData({ ...editFormData, medications: updated });
                          }}
                          placeholder="Frequency (e.g. TID)"
                          className="px-2 py-1 border rounded text-xs"
                        />
                        <input
                          type="text"
                          value={m.duration || ''}
                          onChange={(e) => {
                            const updated = [...editFormData.medications];
                            updated[idx].duration = e.target.value;
                            setEditFormData({ ...editFormData, medications: updated });
                          }}
                          placeholder="Duration (e.g. 5 days)"
                          className="px-2 py-1 border rounded text-xs text-amber-900 font-semibold"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Clinical Impression / Advice Editor */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Advice / Impression:</label>
                  <textarea
                    rows={2}
                    value={editFormData.clinical_impression || editFormData.advice || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, clinical_impression: e.target.value, advice: e.target.value })}
                    className="w-full text-xs p-2 border rounded-lg bg-white"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save & Confirm Extracted Fields</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Structured Display */
              <>
                {/* Lab Investigations Table */}
                {activeDoc.extracted.investigations && activeDoc.extracted.investigations.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Extracted Lab Investigations & Biomarkers
                      </h4>
                      {activeDoc.flag && (
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          ⚠️ {activeDoc.flag}
                        </span>
                      )}
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Test Name</th>
                            <th className="p-3">Observed Value</th>
                            <th className="p-3">Units</th>
                            <th className="p-3">Reference Range</th>
                            <th className="p-3">Status / Flag</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {activeDoc.extracted.investigations.map((item, idx) => (
                            <tr key={idx} className={item.flag === 'HIGH' || item.flag === 'LOW' ? 'bg-rose-50/50' : ''}>
                              <td className="p-3 font-semibold text-slate-900">{item.test}</td>
                              <td className="p-3 font-bold font-mono text-slate-900">
                                {item.value}
                              </td>
                              <td className="p-3 text-slate-600">{item.unit}</td>
                              <td className="p-3 text-slate-600">{item.ref_range || 'Standard'}</td>
                              <td className="p-3">
                                <AbnormalBadge flag={item.flag} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Prescriptions & Medications */}
                {activeDoc.extracted.medications && activeDoc.extracted.medications.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Extracted Prescription Medications
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeDoc.extracted.medications.map((med, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-1">
                          <div className="font-bold text-slate-900 text-sm">{med.name}</div>
                          <div className="text-xs text-slate-600">
                            <span>Dosage: <strong>{med.dosage}</strong></span> • <span>Freq: {med.frequency}</span>
                          </div>
                          {med.duration && (
                            <div className="text-[11px] text-slate-500 font-medium">Duration: {med.duration}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diagnoses */}
                {activeDoc.extracted.diagnoses && activeDoc.extracted.diagnoses.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Documented Diagnoses
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeDoc.extracted.diagnoses.map((dx, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold">
                          {dx}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctor / Lab Impression */}
                {(activeDoc.extracted.clinical_impression || activeDoc.extracted.advice) && (
                  <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 space-y-1">
                    <strong className="block font-bold text-teal-900">Clinical Advice / Impression:</strong>
                    <p>{activeDoc.extracted.clinical_impression || activeDoc.extracted.advice}</p>
                  </div>
                )}
              </>
            )}

          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Source: {activeDoc.extractionSource === 'manual_correction' ? 'Verified by Patient/Staff' : 'Vision OCR Extraction'}</span>
            </span>
          </div>

        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBackToConverse}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 min-h-[48px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Symptoms</span>
        </button>

        <button
          type="button"
          onClick={onProceedToSummary}
          className="inline-flex items-center space-x-2 text-base font-bold text-white px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 shadow-lg shadow-teal-700/30 transition-all min-h-[52px]"
        >
          <span>{t.step4}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Original Image Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Document Image Preview</h3>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-slate-500 hover:text-slate-800 font-bold text-sm px-2 py-1"
              >
                ✕ Close
              </button>
            </div>
            <div className="overflow-auto flex-1 flex items-center justify-center bg-slate-100 rounded-xl p-2">
              <img src={previewImage} alt="Document" className="max-h-[70vh] object-contain rounded" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
