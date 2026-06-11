import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import postsRouter from "./posts";
import commentsRouter from "./comments";
import collegesRouter from "./colleges";
import resourcesRouter from "./resources";
import feedRouter from "./feed";
import notificationsRouter from "./notifications";
import applicationsRouter from "./applications";
import checklistRouter from "./checklist";
import subbridgesRouter from "./subbridges";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(postsRouter);
router.use(commentsRouter);
router.use(collegesRouter);
router.use(resourcesRouter);
router.use(feedRouter);
router.use(notificationsRouter);
router.use(applicationsRouter);
router.use(checklistRouter);
router.use(subbridgesRouter);

export default router;
