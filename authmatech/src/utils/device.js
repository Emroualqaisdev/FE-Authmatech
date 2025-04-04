export const isMobile = () => {
    const ua = navigator.userAgent
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua)
  }
  