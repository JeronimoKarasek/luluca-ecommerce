'use client'

import { useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  images: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
  bucket?: string
  folder?: string
  maxFiles?: number
}

export default function ImageUpload({
  images,
  onChange,
  multiple = true,
  bucket = 'images-luluca',
  folder = 'uploads',
  maxFiles = 10,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif']

    if (!fileExt || !allowedExts.includes(fileExt)) {
      toast.error(`Formato não suportado: .${fileExt}`)
      return null
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx. 5MB)')
      return null
    }

    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      toast.error(`Erro no upload: ${error.message}`)
      return null
    }

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return publicData.publicUrl
  }, [bucket, folder])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)

    if (!multiple && fileArray.length > 1) {
      toast.error('Apenas uma imagem permitida')
      return
    }

    const currentCount = images.filter(u => u).length
    if (currentCount + fileArray.length > maxFiles) {
      toast.error(`Máximo de ${maxFiles} imagens`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = fileArray.map(uploadFile)
      const urls = await Promise.all(uploadPromises)
      const validUrls = urls.filter((u): u is string => u !== null)

      if (validUrls.length > 0) {
        if (multiple) {
          const existingUrls = images.filter(u => u)
          onChange([...existingUrls, ...validUrls])
        } else {
          onChange([validUrls[0]])
        }
        toast.success(`${validUrls.length} imagem(ns) enviada(s)!`)
      }
    } catch {
      toast.error('Erro ao enviar imagens')
    } finally {
      setUploading(false)
    }
  }, [images, multiple, maxFiles, onChange, uploadFile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
      e.target.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeImage = async (index: number) => {
    const url = images[index]

    // Try to delete from storage
    if (url && url.includes(bucket)) {
      try {
        const path = url.split(`${bucket}/`)[1]
        if (path) {
          await supabase.storage.from(bucket).remove([path])
        }
      } catch {
        // Ignore delete errors
      }
    }

    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${dragOver
            ? 'border-luluca-primary bg-luluca-light/20'
            : 'border-gray-200 hover:border-luluca-primary/50 hover:bg-gray-50'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={32} className="text-luluca-primary animate-spin" />
            <p className="text-sm text-gray-500">Enviando...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={32} className="text-gray-400" />
            <p className="text-sm text-gray-600">
              <span className="text-luluca-primary font-medium">Clique para enviar</span> ou arraste imagens aqui
            </p>
            <p className="text-xs text-gray-400">
              JPG, PNG, GIF, WebP, SVG • Máx. 5MB {multiple ? `• Até ${maxFiles} imagens` : ''}
            </p>
          </div>
        )}
      </div>

      {/* Preview grid */}
      {images.filter(u => u).length > 0 && (
        <div className={`grid gap-3 ${multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1 max-w-[200px]'}`}>
          {images.filter(u => u).map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={url}
                alt={`Imagem ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                  const parent = (e.target as HTMLImageElement).parentElement
                  if (parent && !parent.querySelector('.fallback-icon')) {
                    const fallback = document.createElement('div')
                    fallback.className = 'fallback-icon absolute inset-0 flex items-center justify-center text-gray-300'
                    fallback.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>'
                    parent.appendChild(fallback)
                  }
                }}
              />
              {i === 0 && multiple && (
                <span className="absolute top-1 left-1 bg-luluca-primary text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Principal
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(i)
                }}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state for no images */}
      {images.filter(u => u).length === 0 && !uploading && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <ImageIcon size={14} />
          <span>Nenhuma imagem adicionada</span>
        </div>
      )}
    </div>
  )
}
