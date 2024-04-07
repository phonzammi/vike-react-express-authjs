export { guard }

import type { GuardAsync } from 'vike/types'

const guard: GuardAsync = async (pageContext): ReturnType<GuardAsync> => {
    console.log('pageContext :', pageContext.user)
}