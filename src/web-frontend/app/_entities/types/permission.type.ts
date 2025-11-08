import { Action } from "@/app/_entities/enums/permission.enum";
import { User } from "@/app/_entities/interface/old.user.interface";
import { MongoAbility, Subject } from "@casl/ability";

export type Subjects = Subject | User;

export type AppAbility = MongoAbility<[Action, Subjects]>;
