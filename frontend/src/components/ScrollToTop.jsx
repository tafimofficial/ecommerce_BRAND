import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const action = useNavigationType();

    useEffect(() => {
        // Only scroll to top if the navigation is a PUSH action (new page visited)
        // If it's a POP action (back/forward button), let the browser handle standard scroll restoration
        if (action !== 'POP') {
            window.scrollTo(0, 0);
        }
    }, [action, pathname]);

    return null;
};

export default ScrollToTop;
