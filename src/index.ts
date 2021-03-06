interface Params {
	action: string,
	payload: object | null | undefined
}

interface Action {
	type: string
}

export default function pandora(initialState: Object, actions: Object) {

	let topics: Array<Function> = []
	let updates: Array<any> = []
	let state: Object = dup(initialState)

	const getState = (): Object => {
		return state
	}

	const subscribe = (fn: Function): void => {
		if (fn.call) {
			topics.push(fn)
		}
	}

	const unsubscribe = (fn: Function): void => {
		topics = topics.filter(item => item != fn)
	}

	const dispatch = ({ type, ...payload }: Action) => {
		const action = type
		updates.push({ action, payload })
		return new Promise((resolve) => rAF(_ => update({ action, payload }, resolve)))
	}

	const update = ({ action, payload = {} }: Params, resolve): void => {

		updates.forEach(({ action, payload = {} }: Params) => {
			if (!(action in actions)) {
				console.log(`[Pandora] Error -> No action [ ${action} ] found.`)
			} else {
				const data = actions[action].call(null, state, payload, { getState, subscribe, unsubscribe, dispatch })
				Object.assign(state, data)
			}
		})

		if (updates.length) {
			topics.forEach(topic => { topic(state, { action, payload }) })
			updates = []
		}

		resolve(state)
	}

	return {
		getState,
		subscribe,
		unsubscribe,
		dispatch
	}
}

const dup = (object: Object): object => {
	return JSON.parse(JSON.stringify(object))
}

const rAF = (fn: FrameRequestCallback): number => {
	return requestAnimationFrame ? requestAnimationFrame(fn) : 0
}
