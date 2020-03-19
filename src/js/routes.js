
import PlannerPage from '../pages/planner.f7.html';
import MainPage from '../pages/main.f7.html';
import FormPage from '../pages/form.f7.html';

import BuyTicket from '../pages/buy-ticket.f7.html';
import Journey from '../pages/journey.f7.html';
import NotFoundPage from '../pages/404.f7.html';

var routes = [
  {
    path: '/planner/',
    name: 'planner',
    component: PlannerPage,
  },
  {
    path: '/',
    component: MainPage,
  },
  {
    path: '/form',
    component: FormPage,
  },

  {
    path: '/buy-ticket/',
    component: BuyTicket,
  },
  {
    path: '/journey',
    //path: '/',
    name: 'journey',
    component: Journey,
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;