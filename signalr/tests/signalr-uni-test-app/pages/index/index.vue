<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>
		<view class="text-area">
			<text class="title">{{title}}</text>
		</view>
		<button type="default" @click="close">Close</button>
		<button type="default" @click="connect">Connect</button>
	</view>
</template>

<script>
	// import { HubConnectionBuilder, LogLevel } from '../../../../dist/esm';
	import { HubConnectionBuilder, LogLevel } from 'signalr-uni';

	let hub;

	export default {
		data() {
			return {
				title: 'Hello'
			}
		},
		onLoad() {
			// console.log('Event', typeof Event);
			// console.log('MessageEvent', typeof MessageEvent);
			// console.log('CloseEvent', typeof CloseEvent);
			
			hub = new HubConnectionBuilder()
				.withUrl('http://132.232.253.210:22112/chatHub?type=2&uid=3')
				.withAutomaticReconnect([0, 2000, 4000, 8000, 10000, 30000, 60000])
				.configureLogging(LogLevel.Debug)
				.build();

			hub.on('Message', (data) => {
				console.log('on:Message', data);
			});

			this.connect();
		},
		methods: {
			connect() {
				hub.start().then(() => {
					console.log('Connect to signalr server success.');
					hub.invoke('AddGroup', 'jgxy').then(() => {
						console.log('Add group success.');
					}).catch(err => {
						console.error('Add group failed.', err);
					});
				}).catch((err) => {
					console.error('Connect to signalr server failed.', err);
				});
			},
			close() {
				hub.stop().then(res => {
					console.log('Connection stop success.', res);
				}).catch(err => {
					console.error('Connection stop failed.', err);
				});
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
