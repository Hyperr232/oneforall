<script setup lang="ts">
import { inject, ref, markRaw, watch } from "vue";
import type { AxiosInstance } from "axios";
import Card from "primevue/card";
import InputNumber from "primevue/inputnumber";
import Calendar from "primevue/calendar";
import Button from "primevue/button";

type User = {
  id: number;
  name: string;
  surname: string;
  salary: number;
};

interface FormData {
  work: number;
  medical: [];
  vacation: [];
  prize: number;
  isPrize: boolean;
  fine: number;
}

interface FormItem {
  label: string;
  components: FormComponent[];
}

type FormComponent = {
  component: any;
  model: keyof typeof form.value;
  options?: any;
};

const axios = inject("axios") as AxiosInstance;
const users = ref<User[]>([]);
axios
  .get("https://my-json-server.typicode.com/sirattilaz/salary/profile/")
  .then((r) => {
    users.value = r.data;
    currentUser.value = users.value[0];
  });

const currentUser = ref<User>();
const resultSalary = ref();
const createForm = (): FormData => {
  return {
    work: 0,
    medical: [],
    vacation: [],
    prize: 0,
    isPrize: false,
    fine: 0,
  };
};

const form = ref<FormData>(createForm());

const formItems = ref<FormItem[]>([
  {
    label: "Отработал:",
    components: [
      {
        model: "work",
        component: markRaw(InputNumber),
        options: {
          "date-format": "dd.mm.yy",
          "selection-mode": "range",
          placeholder: "Дата",
          "show-button-bar": true,
        },
      },
    ],
  },
  {
    label: "Премия",
    components: [
      {
        component: markRaw(InputNumber),
        model: "prize",
      },
    ],
  },
  {
    label: "Штраф",
    components: [
      {
        component: markRaw(InputNumber),
        model: "fine",
      },
    ],
  },
  {
    label: "Больничный:",
    components: [
      {
        model: "medical",
        component: markRaw(Calendar),
        options: {
          "date-format": "dd.mm.yy",
          "selection-mode": "range",
          placeholder: "Дата",
          "show-button-bar": true,
        },
      },
    ],
  },
  {
    label: "Отпуск:",
    components: [
      {
        model: "vacation",
        component: markRaw(Calendar),
        options: {
          "date-format": "dd.mm.yy",
          "selection-mode": "range",
          placeholder: "Дата",
          "show-button-bar": true,
        },
      },
    ],
  },
]);

const slide = (action: 1 | -1) => {
  const nextIndex =
    users.value.findIndex((u) => u === currentUser.value) + action;
  if (nextIndex < 0) {
    currentUser.value = users.value[0];
  } else if (nextIndex >= users.value.length) {
    currentUser.value = users.value[users.value.length - 1];
  } else {
    currentUser.value = users.value[nextIndex];
  }
  form.value = createForm();
};
const calculateSalary = () => {
  const getDayDateRange = (date: Date[]) => {
    if (date.length >= 2 && date.every((dat) => dat)) {
      const [firstDay, lastDay] = date;
      return (
        (lastDay.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24) + 2
      );
    }
    return date.length;
  };
  if (currentUser.value) {
    const perDay = currentUser.value?.salary;
    const workedDays = form.value.work;
    const prize = form.value.isPrize ? form.value.prize : 0;
    const fine = form.value.fine ?? 0;
    const medicalDays = getDayDateRange(form.value.medical);
    const vacation = getDayDateRange(form.value.vacation);
    const medical =
      medicalDays > 3
        ? 3 * perDay + (medicalDays - 3) * (perDay * 0.5)
        : medicalDays * perDay;

    resultSalary.value =
      (workedDays * perDay + prize - fine + medical - perDay * vacation) * 0.87;
  }
};

// Если есть дети то зависит от количества детей от 1-2-3.
// Если участник ЧАЭС, военный - у них свои вычеты
// ПЛюс инвалидность, идут льготы. Какие льготы и до какой суммы. Налог на доходы физ. лиц.
// Налоговые вычеты
watch(
  () => currentUser.value,
  () => {
    resultSalary.value = 0;
  }
);
</script>

<template>
  <form class="form">
    <header class="form-header">
      {{ currentUser?.name }} {{ currentUser?.surname }} - ЗП:
      {{ resultSalary }}
    </header>
    <div class="p-inputgroup" v-for="item in formItems" :key="item.label">
      <label class="p-inputgroup-addon" :for="item.label">{{
        item.label
      }}</label>
      <component
        v-for="component in item.components"
        :id="item.label"
        :key="component.model"
        :is="component.component"
        v-model="form[component.model]"
        v-bind="component.options"
      />
    </div>
    <div class="form-actions">
      <Button @click.native.prevent="() => slide(-1)">Предыдущий</Button>
      <Button @click.native.prevent="calculateSalary" type="submit"
        >Рассчитать</Button
      >
      <!-- calculateSalary -->
      <Button @click.native.prevent="() => slide(1)">Следующий</Button>
    </div>
  </form>
  <div class="cards">
    <Card
      v-for="user in users"
      :key="user.id"
      :class="{ active: currentUser?.id === user.id }"
    >
      <template #title> {{ user.name }} {{ user.surname }} </template>
      <template #content> В день: {{ user.salary }} </template>
    </Card>
  </div>
</template>

<style lang="less" scoped>
.form {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 2.5rem;
  .p-inputgroup {
    width: 30%;
    flex: 1 0 auto;
  }
  &-header {
    width: 100%;
    color: white;
  }
  &-actions {
    display: flex;
    justify-content: center;
    width: 100%;
    gap: 20px;
  }
}
.cards {
  display: flex;
  gap: 20px;
  .p-card {
    width: 25%;
    margin-bottom: 50px;
    &.active {
      background-color: var(--surface-100);
    }
  }
}
</style>
