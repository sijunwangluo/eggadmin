new Vue({
  el: '#app',
  data() {
    return {
      userList: [],
      dialogVisible: false,
      dialogTitle: '添加用户',
      userForm: {
        username: '',
        email: '',
        password: '',
        role: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchUserList();
  },
  methods: {
    async fetchUserList() {
      try {
        const response = await axios.get('/api/users');
        this.userList = response.data;
      } catch (error) {
        this.$message.error('获取用户列表失败');
      }
    },
    handleAdd() {
      this.dialogTitle = '添加用户';
      this.userForm = {
        username: '',
        email: '',
        password: '',
        role: ''
      };
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.dialogTitle = '编辑用户';
      this.userForm = { ...row };
      this.dialogVisible = true;
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该用户?', '提示', {
          type: 'warning'
        });
        await axios.delete(`/api/users/${row.id}`);
        this.$message.success('删除成功');
        this.fetchUserList();
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败');
        }
      }
    },
    async submitForm() {
      this.$refs.userForm.validate(async (valid) => {
        if (valid) {
          try {
            if (this.userForm.id) {
              await axios.put(`/api/users/${this.userForm.id}`, this.userForm);
            } else {
              await axios.post('/api/users', this.userForm);
            }
            this.$message.success('保存成功');
            this.dialogVisible = false;
            this.fetchUserList();
          } catch (error) {
            this.$message.error('保存失败');
          }
        }
      });
    }
  }
}); 