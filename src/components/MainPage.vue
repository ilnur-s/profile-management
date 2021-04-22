<template>
  <v-data-table
    :headers="headers"
    :items="users"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title>Анкеты сотрудников</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-dialog
          v-model="dialog"
          max-width="500px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="success"
              class="mb-2"
              v-bind="attrs"
              v-on="on"
            >
              Добавить запись
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col
                    cols="12"
                    sm="12"
                    md="12"
                  >
                    <v-text-field
                      v-model="editedItem.fullName"
                      label="Фамилия Имя Отчество"
                      :rules="rules.fullName"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="4"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.birthDate"
                      label="День рождения"
                      type="date"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="12"
                    md="12"
                  >
                    <v-textarea
                      v-model="editedItem.description"
                      label="Описание"
                      :rules="rules.description"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                small
                color="success"
                @click="save"
              >
                Сохранить
              </v-btn>
              <v-btn
                small
                color="error"
                @click="close"
              >
                Отмена
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="headline">Запись будет удалена. Уверены?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="deleteFormConfirm">Ок</v-btn>
              <v-btn color="blue darken-1" text @click="closeDelete">Отмена</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:[`item.actions`]="{ item }">
      <v-icon
        small
        class="mr-2"
        @click="editForm(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        small
        @click="deleteForm(item)"
      >
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn
        color="primary"
        @click="refreshUsers"
      >
        Обновить список
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
import getUsers from '../helpers/getUsers';

export default {
  data: () => ({
    users: [],
    headers: [
      { text: 'Фамилия', value: 'lastName', align: 'start' },
      { text: 'Имя', value: 'firstName' },
      { text: 'Отчество', value: 'middleName' },
      { text: 'Дата рождения', value: 'birthDate' },
      { text: 'Описание', value: 'description' },
      { text: 'Действия', value: 'actions', sortable: false },
    ],
    rules: {
      fullName: [(val) => (val || '').split(' ').length > 1 || 'Необходимо ввести как минимум Фамилию и Имя'],
      description: [(val) => val.length <= 100 || 'Максимум 100 символов'],
    },
    editedIndex: -1,
    editedItem: {
      fullName: '',
      birthDate: '',
      description: '',
    },
    defaultItem: {
      fullName: '',
      birthDate: '',
      description: '',
    },
    dialog: false,
    dialogDelete: false,
  }),
  async mounted() {
    if (localStorage.getItem('users')) {
      try {
        this.users = JSON.parse(localStorage.getItem('users'));
      } catch {
        alert('Произошла ошибка загрузки данных, попробуйте обновить список, либо перезагрузить страницу');
        localStorage.removeItem('users');
      }
    } else {
      await getUsers();
      this.users = JSON.parse(localStorage.getItem('users'));
    }
  },
  watch: {
    users(newList) {
      localStorage.setItem('users', JSON.stringify(newList));
    },
    dialog(val) {
      return val || this.close();
    },
    dialogDelete(val) {
      return val || this.closeDelete();
    },
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Добавить запись' : 'Редактирование анкеты';
    },
  },
  methods: {
    async refreshUsers() {
      await getUsers();
      this.users = await JSON.parse(localStorage.getItem('users'));
    },
    editForm(item) {
      this.editedIndex = this.users.indexOf(item);
      this.editedItem = {
        fullName: `${item.lastName} ${item.firstName} ${item.middleName}`,
        birthDate: item.birthDate,
        description: item.description,
      };
      this.dialog = true;
    },
    deleteForm(item) {
      this.editedIndex = this.users.indexOf(item);
      this.editedItem = {
        fullName: `${item.lastName} ${item.firstName} ${item.middleName}`,
        birthDate: item.birthDate,
        description: item.description,
      };
      this.dialogDelete = true;
    },
    deleteFormConfirm() {
      this.users.splice(this.editedIndex, 1);
      this.closeDelete();
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem };
        this.editedIndex = -1;
      });
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem };
        this.editedIndex = -1;
      });
    },
    save() {
      const optimizedItem = {
        lastName: this.editedItem.fullName.split(' ')[0],
        firstName: this.editedItem.fullName.split(' ')[1],
        middleName: this.editedItem.fullName.split(' ')[2],
        birthDate: this.editedItem.birthDate,
        description: this.editedItem.description,
      };
      if (!optimizedItem.firstName || optimizedItem.description.length > 100) {
        return;
      }
      if (this.editedIndex > -1) {
        Object.assign(this.users[this.editedIndex], optimizedItem);
      } else {
        this.users.unshift(optimizedItem);
      }
      this.close();
    },
  },
};
</script>
