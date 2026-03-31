import Footer from './Footer'
import TopNavBar from './TopNavBar'

function PageLayout({ children, activePage, ...topNavProps }) {
  const isDev = import.meta.env.DEV

  return (
    <div className="min-h-screen bg-surface">
      {isDev && (
        <div className="fixed top-0 left-0 right-0 z-[10000] h-8 bg-primary flex items-center justify-center text-white text-xs font-bold tracking-widest">
          DEMO MODE — NiroCore v1.0 | Exhibition Build
        </div>
      )}
      <TopNavBar activePage={activePage} isDemo={isDev} {...topNavProps} />
      <main
        className={`${
          isDev ? 'pt-[104px]' : 'pt-[72px]'
        } pb-16 min-h-screen`}
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default PageLayout
