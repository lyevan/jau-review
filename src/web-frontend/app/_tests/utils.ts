/* REACT */
import { AccountType } from "@/app/_entities/enums/auth.enum";
import { defineAbility } from "@/app/_utils/permissions";
import { AbilityDefinitionParams } from "../_entities/interface/permission.interface";
import { useParams } from "next/navigation";

export const mockUseParams = (id: string) => {
	vi.mocked(useParams).mockReturnValue({ id });
};

export const mockAbility = async ({
	role = AccountType.SuperAdmin,
	user_id = "1",
}: AbilityDefinitionParams = {}) => {
	const defineAbilityActual = (await vi.importActual("@/app/_utils/permissions")) as {
		defineAbility: typeof defineAbility;
	};
	const ability = defineAbilityActual.defineAbility({ role, user_id });

	vi.mocked(defineAbility).mockReturnValue(ability);
};
