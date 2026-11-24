import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { FileVideo2, Upload, X } from 'lucide-react'
import { apiClient, ApiError } from '../../api/client'
import './UploadDialog.css'

type Props = { open: boolean; onClose: () => void }
type UploadFields = { file: File; title: string; description: string }

async function uploadVideo({ file, title, description }: UploadFields) {
  const form = new FormData()
  form.append('file', file)
  form.append('title', title.trim())
  form.append('description', description.trim())
  const response = await apiClient.post('/videos', form)
  return response.data
}

export default function UploadDialog({ open, onClose }: Props) {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const mutation = useMutation({
    mutationFn: uploadVideo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['videos'] })
      onClose()
    },
  })

  useEffect(() => {
    if (!open) {
      setFile(null)
      setTitle('')
      setDescription('')
      mutation.reset()
    }
  }, [open])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (file) mutation.mutate({ file, title, description })
  }

  const errorMessage = mutation.error instanceof ApiError
    ? mutation.error.message
    : 'The video could not be uploaded. Please try again.'

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="upload-title" PaperProps={{ className: 'upload-dialog-paper' }}>
      <form onSubmit={submit}>
        <DialogTitle className="upload-dialog-title" id="upload-title">
          <span><span className="eyebrow">YOUR STUDIO</span><strong>Upload a video</strong></span>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close upload dialog"><X size={19} /></button>
        </DialogTitle>
        <DialogContent className="upload-dialog-content">
          <label className={`file-picker${file ? ' has-file' : ''}`} htmlFor="video-file">
            <input id="video-file" type="file" accept="video/*" required onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            <span className="file-picker-icon"><FileVideo2 size={21} /></span>
            <strong>{file ? file.name : 'Choose a video to upload'}</strong>
            <small>{file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'MP4, MOV, or WebM'}</small>
            <span className="file-picker-button"><Upload size={15} /> Browse files</span>
          </label>

          <label className="form-field">
            <span>Video title <i>*</i></span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={120} placeholder="Give your video a clear title" />
            <small>{title.length}/120</small>
          </label>

          <label className="form-field">
            <span>Description <i>*</i></span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} required maxLength={2000} rows={4} placeholder="What should viewers know about this video?" />
            <small>{description.length}/2000</small>
          </label>

          <p className="upload-metadata-note">Upload date and video duration are recorded by the platform when the video is processed.</p>
          {mutation.isError && <p className="upload-error" role="alert">{errorMessage}</p>}
        </DialogContent>
        <DialogActions className="upload-dialog-actions">
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" startIcon={<Upload size={16} />} disabled={!file || !title.trim() || !description.trim() || mutation.isPending}>
            {mutation.isPending ? 'Uploading…' : 'Upload video'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
