const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'
const FILE_NAME = 'onefit-data.json'

async function driveRequest(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Drive API error ${res.status}: ${text}`)
  }
  return res
}

export async function findAppDataFile(accessToken) {
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    q: `name='${FILE_NAME}'`,
    fields: 'files(id,modifiedTime)',
  })
  const res = await driveRequest(`${DRIVE_API}/files?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  if (data.files && data.files.length > 0) {
    return { fileId: data.files[0].id, modifiedTime: data.files[0].modifiedTime }
  }
  return null
}

export async function readFile(accessToken, fileId) {
  const res = await driveRequest(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}

export async function createFile(accessToken, data) {
  const metadata = {
    name: FILE_NAME,
    parents: ['appDataFolder'],
  }

  const boundary = '---onefit_boundary_' + Date.now()
  const body =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) + '\r\n' +
    `--${boundary}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(data) + '\r\n' +
    `--${boundary}--`

  const res = await driveRequest(`${UPLOAD_API}/files?uploadType=multipart`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  })
  const result = await res.json()
  return result.id
}

export async function updateFile(accessToken, fileId, data) {
  await driveRequest(`${UPLOAD_API}/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}
