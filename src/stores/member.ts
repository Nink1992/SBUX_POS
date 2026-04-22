import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { z } from "zod";

export type Member = {
  id: string;
  levelName: string;
  maskedPhone?: string;
};

const CodeSchema = z.string().min(4).max(64);
const AccountSchema = z.string().trim().regex(/^\d{11}$/);

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function maskPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 11) return raw;
  return `${digits.slice(0, 3)}****${digits.slice(7)}`;
}

export const useMemberStore = defineStore("member", () => {
  const member = ref<Member | null>(null);
  const visitorNo = ref<string>(`NO.${String(Math.floor(Math.random() * 900000) + 100000)}`);

  const isGuest = computed(() => member.value === null);

  function logout() {
    member.value = null;
    visitorNo.value = `NO.${String(Math.floor(Math.random() * 900000) + 100000)}`;
  }

  function loginByMemberCode(code: string) {
    const parsed = CodeSchema.safeParse(code);
    if (!parsed.success) return { ok: false as const, message: "会员码不合法" };

    member.value = {
      id: uid("m"),
      levelName: "银星会员",
      maskedPhone: "176****8655"
    };
    return { ok: true as const };
  }

  function loginByAccount(account: string) {
    const parsed = AccountSchema.safeParse(account);
    if (!parsed.success) return { ok: false as const, message: "请输入 11 位会员账号" };

    member.value = {
      id: uid("m"),
      levelName: "银星会员",
      maskedPhone: maskPhone(account)
    };
    return { ok: true as const };
  }

  return { member, visitorNo, isGuest, logout, loginByMemberCode, loginByAccount };
});
