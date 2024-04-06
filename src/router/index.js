import { createRouter, createWebHistory } from "vue-router";
import homeView from "../views/home/homeView.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: homeView
		},
		{
			path: "/:pathMatch(.*)*",
			name: "not-found",
			meta: {
				isAuth: true
			},
			component: () => import("../views/PageNotFoundView.vue"),
		},
	],
    linkActiveClass: 'active-link',
    linkExactActiveClass: 'exact-active-link',
});

export default router;