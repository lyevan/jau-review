/* PLUGINS */
import { AbilityBuilder, createMongoAbility } from "@casl/ability";
/* ENTITIES */
import { AccountType } from "@/app/_entities/enums/auth.enum";
import { Action, Subject } from "@/app/_entities/enums/permission.enum";
import { AppAbility } from "@/app/_entities/types/permission.type";
import { AbilityDefinitionParams } from "@/app/_entities/interface/permission.interface";

export const defineAbility = ({ role, user_id }: AbilityDefinitionParams): AppAbility => {
	const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

	/* Allow all actions for super admin */
	if (role === AccountType.SuperAdmin) {
		can(Action.Manage, Subject.All);
	}

	/* Allow all actions except it cannot update other user and cannot delete users */
	if (role === AccountType.Admin) {
		can(Action.Manage, Subject.All);
		cannot(Action.Update, Subject.User, {
			id: { $ne: user_id },
		});
		cannot(Action.Delete, Subject.User, {
			id: { $ne: user_id },
		});
	}

	if (role === AccountType.Patient) {
		can(Action.Update, Subject.User, { id: { $eq: user_id } });
	}

	/* Restrict all actions for undefined or unprivileged roles */
	if (!role) {
		cannot(Action.Manage, Subject.All);
	}

	return build();
};
