const memberApp = new Vue({
  el: '.member-content-card',
  data() {
    // 定义自定义验证规则
    const validatePassword = (rule, value, callback) => {
      if (!this.form._id && !value) {
        callback(new Error('请输入密码'));
      } else if (value && value.length < 6) {
        callback(new Error('密码长度不能小于6位'));
      } else {
        callback();
      }
    };

    const validateConfirmPassword = (rule, value, callback) => {
      if (!this.form._id && !value) {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.form.password) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };

    return {
      memberList: [],
      searchKeyword: '',
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      selectedMembers: [],
      pagination: {
        total: 0,
        page: 1,
        pageSize: 10
      },
      form: {
        account: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        email: '',
        idCardNumber: '',
        walletBalance: 0,
        points: 0,
        gender: 'unknown'
      },
      rules: {
        account: [
          { required: true, message: '请输入会员账号', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { validator: validatePassword, trigger: 'blur' }
        ],
        confirmPassword: [
          { validator: validateConfirmPassword, trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入会员姓名', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        idCardNumber: [
          { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
        ]
      }
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const { data } = await axios.get('/api/members', {
          params: {
            page: this.pagination.page,
            pageSize: this.pagination.pageSize,
            keyword: this.searchKeyword
          }
        });
        if (data.success) {
          this.memberList = data.data.list.map(member => ({
            ...member,
            registrationTime: new Date(member.registrationTime).toLocaleString()
          }));
          this.pagination.total = data.data.total;
        }
      } catch (error) {
        this.$message.error('获取会员列表失败');
      }
      this.loading = false;
    },
    handleSearch() {
      this.pagination.page = 1;
      this.fetchData();
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.fetchData();
    },
    handleCurrentChange(val) {
      this.pagination.page = val;
      this.fetchData();
    },
    handleSelectionChange(val) {
      this.selectedMembers = val;
    },
    handleAdd() {
      this.dialogTitle = '添加会员';
      this.form = {
        account: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        email: '',
        idCardNumber: '',
        walletBalance: 0,
        points: 0,
        gender: 'unknown'
      };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.form.clearValidate();
      });
    },
    handleEdit(row) {
      this.dialogTitle = '编辑会员';
      // 复制数据，但不包含密码，避免在编辑时显示哈希值
      this.form = { ...row, password: '', confirmPassword: '' };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.form.clearValidate();
      });
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该会员吗？', '提示', {
          type: 'warning'
        });
        const { data } = await axios.delete(`/api/members/${row._id}`);
        if (data.success) {
          this.$message.success('删除成功');
          this.fetchData();
        } else {
          this.$message.error(data.message || '删除失败');
        }
      } catch (error) {
        if (error && error.message !== 'cancel') {
          this.$message.error('删除失败');
        }
      }
    },
    async handleBatchDelete() {
      try {
        await this.$confirm(`确认删除选中的 ${this.selectedMembers.length} 个会员吗？`, '提示', {
          type: 'warning'
        });
        const { data } = await axios.post('/api/members/batchDelete', {
          ids: this.selectedMembers.map(item => item._id)
        });
        if (data.success) {
          this.$message.success('批量删除成功');
          this.fetchData();
        } else {
          this.$message.error(data.message || '批量删除失败');
        }
      } catch (error) {
        if (error && error.message !== 'cancel') {
          this.$message.error('批量删除失败');
        }
      }
    },
    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            let response;
            // 准备提交的数据，不发送confirmPassword
            const submitForm = { ...this.form };
            delete submitForm.confirmPassword;
            
            if (submitForm._id) {
              // 如果是编辑，且密码为空，则不发送密码字段
              if (!submitForm.password) {
                delete submitForm.password;
              }
              response = await axios.put(`/api/members/${submitForm._id}`, submitForm);
            } else {
              response = await axios.post('/api/members', submitForm);
            }

            if (response.data.success) {
              this.$message.success(submitForm._id ? '更新成功' : '创建成功');
              this.dialogVisible = false;
              this.fetchData();
            } else {
              this.$message.error(response.data.message || (submitForm._id ? '更新失败' : '创建失败'));
            }
          } catch (error) {
            this.$message.error(error.response.data.message || (this.form._id ? '更新失败' : '创建失败'));
          }
        }
      });
    }
  }
}); 