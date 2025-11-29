import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";

interface ImageCropperProps {
    file: File;
    onComplete: (blob: Blob) => void;
    onCancel: () => void;
    /** Se true, mantém aspecto livre (usuário enquadra como quiser) */
    freeAspect?: boolean;
    /** Aspect ratio sugerido (ex: 16/9, 4/3, 1). Se freeAspect=true, é ignorado */
    suggestedAspect?: number;
}

export default function ImageCropper({ 
    file, 
    onComplete, 
    onCancel, 
    freeAspect = true,
    suggestedAspect = 16 / 9 
}: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [aspect, setAspect] = useState<number | undefined>(freeAspect ? undefined : suggestedAspect);
    const [saving, setSaving] = useState(false);

    // Criar URL da imagem
    useEffect(() => {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels || !imageUrl) return;
        setSaving(true);
        try {
            const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels, rotation);
            onComplete(croppedBlob);
        } catch (error) {
            console.error('Erro ao cortar imagem:', error);
        } finally {
            setSaving(false);
        }
    };

    // Presets de aspect ratio
    const aspectPresets = [
        { label: 'Livre', value: undefined },
        { label: '16:9', value: 16/9 },
        { label: '4:3', value: 4/3 },
        { label: '1:1', value: 1 },
        { label: '9:16', value: 9/16 },
    ];

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                <h3 className="text-white font-semibold text-lg">✂️ Ajustar Imagem</h3>
                <p className="text-slate-400 text-sm hidden sm:block">
                    Arraste para mover • Use o zoom para ajustar
                </p>
            </div>

            {/* Área do Cropper - ocupa a maior parte da tela */}
            <div className="flex-1 relative min-h-0">
                {imageUrl && (
                    <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                        showGrid={true}
                        zoomSpeed={0.1}
                        minZoom={0.5}
                        maxZoom={5}
                        restrictPosition={false}
                        style={{
                            containerStyle: {
                                backgroundColor: '#0f172a',
                            },
                        }}
                    />
                )}
            </div>

            {/* Controles */}
            <div className="bg-slate-900 border-t border-slate-700 p-4 space-y-4">
                {/* Zoom Slider */}
                <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-sm w-16">🔍 Zoom</span>
                    <input
                        type="range"
                        min={0.5}
                        max={5}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <span className="text-slate-300 text-sm w-12 text-right">{Math.round(zoom * 100)}%</span>
                </div>

                {/* Rotation Slider */}
                <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-sm w-16">🔄 Rotação</span>
                    <input
                        type="range"
                        min={-180}
                        max={180}
                        step={1}
                        value={rotation}
                        onChange={(e) => setRotation(Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <span className="text-slate-300 text-sm w-12 text-right">{rotation}°</span>
                </div>

                {/* Aspect Ratio Presets */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 text-sm">Formato:</span>
                    {aspectPresets.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => setAspect(preset.value)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition ${
                                aspect === preset.value
                                    ? 'bg-sky-500 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* Botões de ação */}
                <div className="flex justify-end gap-3 pt-2">
                    <button 
                        onClick={onCancel} 
                        className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition"
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-semibold transition disabled:opacity-50"
                        disabled={saving || !croppedAreaPixels}
                    >
                        {saving ? '⏳ Processando...' : '✅ Usar esta imagem'}
                    </button>
                </div>
            </div>
        </div>
    );
}

