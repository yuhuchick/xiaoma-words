<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/* 全局样式 */
	page {
		background-color: #f8f9fa;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
	}

	/* 通用样式类 */
	.flex {
		display: flex;
	}

	.flex-column {
		flex-direction: column;
	}

	.align-center {
		align-items: center;
	}

	.justify-center {
		justify-content: center;
	}

	.justify-between {
		justify-content: space-between;
	}

	.text-center {
		text-align: center;
	}

	/* 按钮样式 */
	.btn {
		padding: 20rpx 40rpx;
		border-radius: 25rpx;
		font-size: 28rpx;
		font-weight: 600;
		text-align: center;
		border: none;
		outline: none;
	}

	.btn-primary {
		background: #4A90E2;
		color: #ffffff;
	}

	.btn-secondary {
		background: #6c757d;
		color: #ffffff;
	}

	.btn-success {
		background: #28a745;
		color: #ffffff;
	}

	.btn-danger {
		background: #dc3545;
		color: #ffffff;
	}

	/* 卡片样式 */
	.card {
		background: #ffffff;
		border-radius: 15rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	/* 文本样式 */
	.text-primary {
		color: #4A90E2;
	}

	.text-secondary {
		color: #6c757d;
	}

	.text-success {
		color: #28a745;
	}

	.text-danger {
		color: #dc3545;
	}

	.text-muted {
		color: #6c757d;
	}

	/* 间距样式 */
	.mt-10 { margin-top: 10rpx; }
	.mt-20 { margin-top: 20rpx; }
	.mt-30 { margin-top: 30rpx; }
	.mb-10 { margin-bottom: 10rpx; }
	.mb-20 { margin-bottom: 20rpx; }
	.mb-30 { margin-bottom: 30rpx; }
	.ml-10 { margin-left: 10rpx; }
	.ml-20 { margin-left: 20rpx; }
	.mr-10 { margin-right: 10rpx; }
	.mr-20 { margin-right: 20rpx; }

	.p-10 { padding: 10rpx; }
	.p-20 { padding: 20rpx; }
	.p-30 { padding: 30rpx; }
	.pt-10 { padding-top: 10rpx; }
	.pt-20 { padding-top: 20rpx; }
	.pb-10 { padding-bottom: 10rpx; }
	.pb-20 { padding-bottom: 20rpx; }
	.pl-10 { padding-left: 10rpx; }
	.pl-20 { padding-left: 20rpx; }
	.pr-10 { padding-right: 10rpx; }
	.pr-20 { padding-right: 20rpx; }
</style>
