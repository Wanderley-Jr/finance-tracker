export default function NavBar() {
    return (
        <nav className="navbar navbar-expand-lg bg-primary border-bottom border-2">
            <div className="container-fluid">
                <a className="navbar-brand text-white" href="/">
                    <img
                        src="/favicon.png"
                        alt=""
                        width="32"
                        height="32"
                        className="me-2"
                    />
                    Finance Tracker
                </a>
            </div>
        </nav>
    )
}