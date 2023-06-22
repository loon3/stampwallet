const isRunningInWeb = process.env.NEXT_PUBLIC_RUNNING_ENV === 'WEB'

export const chromeSendMessage = (message) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response)
    })
  })
}

export const getLocalItem = async (key) => {
  if (isRunningInWeb) {
    if (typeof window === 'undefined') return undefined
    return localStorage.getItem(key)
  } else {
    const res = await chrome.storage.local.get([key])
    return res[key]
  }
}

export const setLocalItem = async (key, value) => {
  if (isRunningInWeb) {
    return localStorage.setItem(key, value)
  } else {
    await chrome.storage.local.set({ [key]: value })
  }
}

export const removeLocalItem = async (key) => {
  if (isRunningInWeb) {
    return localStorage.removeItem(key)
  } else {
    const res = await chrome.storage.local.remove([key])
    return res[key]
  }
}

export const getSessionItem = async (key) => {
  if (isRunningInWeb) {
    if (typeof window === 'undefined') return undefined
    return sessionStorage.getItem(key)
  } else {
    const res = await chrome.storage.session.get([key])
    return res[key]
  }
}

export const setSessionItem = async (key, value) => {
  if (isRunningInWeb) {
    return sessionStorage.setItem(key, value)
  } else {
    await chrome.storage.session.set({ [key]: value })
  }
}

export const removeSessionItem = async (key) => {
  if (isRunningInWeb) {
    return sessionStorage.removeItem(key)
  } else {
    const res = await chrome.storage.session.remove([key])
  }
}
