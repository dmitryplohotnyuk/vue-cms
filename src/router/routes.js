export default [
    {
        path: '/*/en',
        redirect: '/*',
    },
    {
        name: 'dashboard',
        path: '/',
        alias: '/en/',
        component: () => import('@/views/Dashboard'),
        meta: {
            authRequired: true,
        },
        props: true,
    },
    {
        name: 'signin',
        path: '/signin',
        alias: '/en/signin',
        component: () => import('@/views/Auth'),
        meta: {
            redirectAuth: 'dashboard',
        },
    },
    {
        name: 'signup',
        path: '/signup',
        alias: '/en/signup',
        component: () => import('@/views/Auth'),
        meta: {
            redirectAuth: 'dashboard',
        },
    },
    {
        name: 'signout',
        path: '/signout',
        alias: '/en/signout',
        meta: {
            authRequired: true,
        },
    },
    {
        name: 'reset',
        path: '/reset/:token?',
        alias: '/en/reset/:token?',
        component: () => import('@/views/Auth'),
        props: true,
        meta: {
            redirectAuth: 'dashboard',
        },
    },
    {
        name: 'auth',
        path: '/auth/:service/:op?',
        alias: '/en/auth/:service/:op?',
        component: () => import('@/views/Auth'),
        props: true,
    },
    {
        name: 'account',
        path: '/account/:view?/:id?',
        alias: '/en/account/:view?/:id?',
        component: () => import('@/views/Account'),
        meta: {
            authRequired: true,
        },
        props: true,
    },
    {
        name: 'billing',
        path: '/billing/:view?',
        alias: '/en/billing/:view?',
        component: () => import('@/views/Billing'),
        meta: {
            authRequired: true,
        },
        props: true,
    },
    {
        name: 'teams',
        path: '/teams/:id?',
        alias: '/en/teams/:id?',
        component: () => import('@/views/Teams'),
        meta: {
            authRequired: true,
        },
        props: true,
    },
    {
        name: 'contacts',
        path: '/contacts/:id?',
        alias: '/en/contacts/:id?',
        component: () => import('@/views/Contacts'),
        meta: {
            authRequired: true,
        },
        props: true,
    },
    {
        name: 'integrations',
        path: '/integrations/:service?/:op?',
        alias: '/en/integrations/:service?/:op?',

        component: () => import('@/views/Integrations'),
        meta: {
            authRequired: true,
        },
        props: true,
    },
    {
        name: 'project-create',
        path: '/project/create',
        alias: '/en/project/create',
        component: () => import('@/views/CreateProject'),
        meta: {
            authRequired: true,
        },
    },
    {
        name: 'project',
        path: '/project/:id/:view?/:subview?/:entity?',
        alias: '/en/project/:id/:view?/:subview?/:entity?',
        component: () => import('@/views/Project'),
        meta: {
            authRequired: true,
        },
        props: true,
    },
    {
        name: 'mailchimp',
        path: '/mailchimp',
        alias: '/en/mailchimp',
        component: () => import('@/views/Mailchimp'),
        meta: {
            authRequired: true,
        },
        props: true,
    },
    {
        name: 'products',
        path: '/products/:id?/:plan?',
        alias: '/en/products/:id?/:plan?',

        component: () => import('@/views/Products'),
        meta: {
            authRequired: true,
        },
        props: true,
    },
    {
        name: '404',
        path: '/404',
        alias: '/en/404',
        component: () => import('@/views/404'),
        // Allows props to be passed to the 404 page through route
        // params, such as `resource` to define what wasn't found.
        props: true,
    },
    {
        name: '500',
        path: '/500',
        component: () => import('@/views/500'),
        props: true,
    },
    // Redirect any unmatched routes to the 404 page. This may
    // require some server configuration to work in production:
    // https://router.vuejs.org/en/essentials/history-mode.html#example-server-configurations
    {
        path: '*',
        redirect: '404',
    },
]
/*
TODO: refactor to use children routes
with <router-view> in project component
    {
        name: 'project',
        path: '/project/:id',
        alias: '/en/project/:id',
        component: () => lazyLoadView(import('@/views/Project')),
        meta: {
            authRequired: true,
        },
        props: true,
        children: [
            {
                path: ':view/:subview?',
                component: () => lazyLoadView(import('@/components/cost/budget')),
                name: 'budget',
                props: true,
            },
        ],
    },
*/
// Lazy-loads view components, but with better UX. A loading view
// will be used if the component takes a while to load, falling
// back to a timeout view in case the page fails to load. You can
// use this component to lazy-load a route with:
//
// component: () => lazyLoadView(import('@/views/my-view'))
//
// NOTE: Components loaded with this strategy DO NOT have access
// to in-component guards, such as beforeRouteEnter,
// beforeRouteUpdate, and beforeRouteLeave. You must either use
// route-level guards instead or lazy-load the component directly:
//
// component: () => import('@/views/my-view')
//
// function lazyLoadView(AsyncView) {
//     const AsyncHandler = () => ({
//         component: AsyncView,
//         // A component to use while the component is loading.
//         loading: require('@/views/Loading').default,
//         // A fallback component in case the timeout is exceeded
//         // when loading the component.
//         error: require('@/views/Timeout').default,
//         // Delay before showing the loading component.
//         // Default: 200 (milliseconds).
//         delay: 400,
//         // Time before giving up trying to load the component.
//         // Default: Infinity (milliseconds).
//         timeout: 10000,
//     })
//
//     return Promise.resolve({
//         functional: true,
//         render(h, { data, children }) {
//             // Transparently pass any props or children to the view component.
//             return h(AsyncHandler, data, children)
//         },
//     })
// }
