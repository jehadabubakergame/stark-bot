const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    AuditLogEvent,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior
} = require('@discordjs/voice');

const playdl = require('play-dl');
const fs = require('fs');

const MUSIC_CHANNEL_ID = '1479199357273116732';
const musicQueues = new Map();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('clientReady', () => {
    console.log(`البوت شغال: ${client.user.tag}`);
});


// --------------------------------------------------------دخول عضو----------------------------------------------------------


client.on('guildMemberAdd', member => {
   const channel = member.guild.channels.cache.get('1517912082014535710');

    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor('#00ff66')
        .setAuthor({
            name: member.user.tag,
            iconURL: member.user.displayAvatarURL({ dynamic: true })
        })
        .setTitle('📥 عضو جديد')
        .setDescription(`${member} انضم إلى السيرفر`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
            { name: '🆔 ID', value: member.id, inline: true },
            { name: '👥 عدد الأعضاء', value: `${member.guild.memberCount}`, inline: true },
            { name: '📅 عمر الحساب', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` }
        )
        .setFooter({ text: member.guild.name })
        .setTimestamp();

    channel.send({ embeds: [embed] });
});





// -------------------------------------------------------خروج عضو------------------------------------------------------------





client.on('guildMemberRemove', member => {
   const channel = member.guild.channels.cache.get('1517912082014535710');

    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor('#ff3333')
        .setAuthor({
            name: member.user.tag,
            iconURL: member.user.displayAvatarURL({ dynamic: true })
        })
        .setTitle('🚨 مغادرة عضو')
        .setDescription(`${member.user.tag} غادر السيرفر`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
            { name: '🆔 ID', value: member.id, inline: true },
            { name: '👥 عدد الأعضاء', value: `${member.guild.memberCount}`, inline: true },
            { name: '📅 عمر الحساب', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` }
        )
        .setFooter({ text: member.guild.name })
        .setTimestamp();

    channel.send({ embeds: [embed] });
});







// ------------------------------------------------------ميوت ديفين------------------------------------------------------------








client.on('voiceStateUpdate', async (oldState, newState) => {
    const channel = newState.guild.channels.cache.get('1517916976435953704');

    if (!channel) return;

    const member = newState.member;
    if (!member) return;

    let title = '';
    let color = '';

    if (!oldState.serverMute && newState.serverMute) {
        title = '🔇 تم إعطاء ميوت';
        color = '#ff3333';
    } else if (oldState.serverMute && !newState.serverMute) {
        title = '🎙️ تم فك الميوت';
        color = '#00ff66';
    } else if (!oldState.serverDeaf && newState.serverDeaf) {
        title = '🎧 تم إعطاء ديفين';
        color = '#ff3333';
    } else if (oldState.serverDeaf && !newState.serverDeaf) {
        title = '👂 تم فك الديفين';
        color = '#00ff66';
    } else {
        return;
    }

    let executor = 'غير معروف';

    try {
        const logs = await newState.guild.fetchAuditLogs({ limit: 5 });
        const log = logs.entries.first();

        if (log?.executor) {
            executor = `<@${log.executor.id}>`;
        }
    } catch (err) {}

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
            {
                name: '👮 الإداري',
                value: executor,
                inline: true
            },
            {
                name: '👤 العضو',
                value: `${member}`,
                inline: true
            },
            {
                name: '🆔 ID',
                value: member.id,
                inline: false
            }
        )
        .setFooter({ text: newState.guild.name })
        .setTimestamp();

    channel.send({ embeds: [embed] });
});








// ----------------------------------------------------  حذف رسالة- -----------------------------------------------------------








client.on('messageDelete', async message => {
    if (message.author?.bot) return;

   const channel = message.guild.channels.cache.get('1517921972342755459');

    if (!channel) return;

    let executor = 'غير معروف';

    try {
        const logs = await message.guild.fetchAuditLogs({ limit: 5, type: AuditLogEvent.MessageDelete });
        const log = logs.entries.find(entry =>
            entry.target?.id === message.author.id &&
            Date.now() - entry.createdTimestamp < 5000
        );

        if (log?.executor) {
            executor = `<@${log.executor.id}>`;
        }
    } catch (err) {}

    const embed = new EmbedBuilder()
        .setColor('#ff3333')
        .setTitle('🗑️ تم حذف رسالة')
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
    {
        name: '👤 صاحب الرسالة',
        value: `${message.author}`,
        inline: false
    },
    {
        name: '🛡️ الذي حذفها',
        value: executor,
        inline: false
    },
    {
        name: '📍 الروم',
        value: `${message.channel}`,
        inline: false
    },
    {
        name: '💬 الرسالة الأصلية',
        value: message.content || 'لا يوجد نص',
        inline: false
    }
)
        .setTimestamp();

    channel.send({ embeds: [embed] });
});

// تعديل رسالة
client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

   const channel = oldMessage.guild.channels.cache.get('1517921972342755459');

    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor('#ffaa00')
        .setTitle('✏️ تم تعديل رسالة')
        .setThumbnail(oldMessage.author.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
    {
        name: '👤 صاحب الرسالة',
        value: `${oldMessage.author}`,
        inline: false
    },
    {
        name: '📍 الروم',
        value: `${oldMessage.channel}`,
        inline: false
    },
    {
        name: '💬 الرسالة القديمة',
        value: oldMessage.content || 'لا يوجد نص',
        inline: false
    },
    {
        name: '🆕 الرسالة الجديدة',
        value: newMessage.content || 'لا يوجد نص',
        inline: false
    }
)
        .setTimestamp();

    channel.send({ embeds: [embed] });
});









// ------------------------------------------------------باند عضو  ------------------------------------------------------------
// ======================================== باند عضو ==============================================









client.on('guildBanAdd', async ban => {
    const channel = ban.guild.channels.cache.get('1517925042908827789');
    if (!channel) return;

    let executor = 'غير معروف';
    let reason = 'لا يوجد سبب';

    try {
        const logs = await ban.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberBanAdd
        });

        const log = logs.entries.first();

        if (log) {
            executor = `<@${log.executor.id}>`;
            reason = log.reason || 'لا يوجد سبب';
        }
    } catch {}

    const embed = new EmbedBuilder()
        .setColor('#cc0000')
        .setTitle('🛑 تم تبنيد عضو')
        .setThumbnail(ban.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
            {
                name: '👤 العضو المبند',
                value: `${ban.user.tag}\n<@${ban.user.id}>`,
                inline: false
            },
            {
                name: '🛡️ الإداري',
                value: executor,
                inline: false
            },
            {
                name: '🆔 ID العضو',
                value: ban.user.id,
                inline: false
            },
            {
                name: '📌 السبب',
                value: reason,
                inline: false
            }
        )
        .setTimestamp();

    channel.send({ embeds: [embed] });
});







// ==================== لوقات التايم أوت ====================
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const channel = newMember.guild.channels.cache.get('1517916976435953704');
    if (!channel) return;

    const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
    const newTimeout = newMember.communicationDisabledUntilTimestamp;

    if (oldTimeout === newTimeout) return;

    let title = '';
    let color = '';
    let timeoutText = '';

    if (!oldTimeout && newTimeout) {
        title = '⏳ تم إعطاء تايم أوت';
        color = '#ff3333';
        timeoutText = `<t:${Math.floor(newTimeout / 1000)}:R>`;
    } else if (oldTimeout && !newTimeout) {
        title = '✅ تم فك التايم أوت';
        color = '#00ff66';
        timeoutText = 'تم فك التايم أوت';
    } else if (oldTimeout && newTimeout && oldTimeout !== newTimeout) {
        title = '♻️ تم تعديل مدة التايم أوت';
        color = '#ffaa00';
        timeoutText = `<t:${Math.floor(newTimeout / 1000)}:R>`;
    } else {
        return;
    }

    let executor = 'غير معروف';
    let reason = 'لا يوجد سبب';

    try {
        const logs = await newMember.guild.fetchAuditLogs({
            limit: 5,
            type: AuditLogEvent.MemberUpdate
        });

        const log = logs.entries.find(entry =>
            entry.target?.id === newMember.id &&
            Date.now() - entry.createdTimestamp < 10000
        );

        if (log?.executor) executor = `<@${log.executor.id}>`;
        if (log?.reason) reason = log.reason;
    } catch {}

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
            { name: '👤 العضو', value: `${newMember}`, inline: false },
            { name: '🛡️ المسؤول', value: executor, inline: false },
            { name: '⏱️ المدة / الحالة', value: timeoutText, inline: false },
            { name: '📌 السبب', value: reason, inline: false },
            { name: '🆔 ID العضو', value: newMember.id, inline: false }
        )
        .setFooter({ text: newMember.guild.name })
        .setTimestamp();

    channel.send({ embeds: [embed] });
});







// ===================================================== طرد عضو =====================================================







client.on('guildMemberRemove', async member => {
    const channel = member.guild.channels.cache.get('1517925042908827789');
    if (!channel) return;

    try {
        const logs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberKick
        });

        const log = logs.entries.first();

        if (!log) return;
        if (log.target.id !== member.id) return;

        const executor = `<@${log.executor.id}>`;
        const reason = log.reason || 'لا يوجد سبب';

        const embed = new EmbedBuilder()
            .setColor('#ff9900')
            .setTitle('👢 تم طرد عضو')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                {
                    name: '👤 العضو المطرود',
                    value: `${member.user.tag}\n<@${member.id}>`,
                    inline: false
                },
                {
                    name: '🛡️ الإداري',
                    value: executor,
                    inline: false
                },
                {
                    name: '🆔 ID العضو',
                    value: member.id,
                    inline: false
                },
                {
                    name: '📌 السبب',
                    value: reason,
                    inline: false
                }
            )
            .setTimestamp();

        channel.send({ embeds: [embed] });

    } catch {}
});









// ==================== لوقات القنوات ====================






// إنشاء قناة
client.on('channelCreate', async channelCreated => {
    const logChannel = channelCreated.guild.channels.cache.get('1517930912765968574');
    if (!logChannel) return;

    let executor = 'غير معروف';

    try {
        const logs = await channelCreated.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.ChannelCreate
        });

        const log = logs.entries.first();
        if (log?.executor) executor = `<@${log.executor.id}>`;
    } catch {}

    const embed = new EmbedBuilder()
        .setColor('#00ff66')
        .setTitle('♻️ تم إنشاء قناة')
        .addFields(
            { name: '🛡️ الإداري', value: executor, inline: false },
            { name: '📌 اسم القناة', value: `${channelCreated.name}`, inline: false },
            { name: '🆔 ID القناة', value: channelCreated.id, inline: false },
            { name: '📂 النوع', value: `${channelCreated.type}`, inline: false }
        )
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
});

// حذف قناة
client.on('channelDelete', async channelDeleted => {
    const logChannel = channelDeleted.guild.channels.cache.get('1517930912765968574');
    if (!logChannel) return;

    let executor = 'غير معروف';

    try {
        const logs = await channelDeleted.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.ChannelDelete
        });

        const log = logs.entries.first();
        if (log?.executor) executor = `<@${log.executor.id}>`;
    } catch {}

    const embed = new EmbedBuilder()
        .setColor('#ff3333')
        .setTitle('🗑️ تم حذف قناة')
        .addFields(
            { name: '🛡️ الإداري', value: executor, inline: false },
            { name: '📌 اسم القناة', value: `${channelDeleted.name}`, inline: false },
            { name: '🆔 ID القناة', value: channelDeleted.id, inline: false },
            { name: '📂 النوع', value: `${channelDeleted.type}`, inline: false }
        )
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
});

// تعديل قناة
client.on('channelUpdate', async (oldChannel, newChannel) => {
    const logChannel = newChannel.guild.channels.cache.get('1517930912765968574');
    if (!logChannel) return;

    let executor = 'غير معروف';

    try {
        const logs = await newChannel.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.ChannelUpdate
        });

        const log = logs.entries.first();
        if (log?.executor) executor = `<@${log.executor.id}>`;
    } catch {}

    let changes = [];

    if (oldChannel.name !== newChannel.name) {
        changes.push(`**اسم القناة:**\nقبل: ${oldChannel.name}\nبعد: ${newChannel.name}`);
    }

    if (oldChannel.topic !== newChannel.topic) {
        changes.push(`**وصف/Topic القناة:**\nقبل: ${oldChannel.topic || 'لا يوجد'}\nبعد: ${newChannel.topic || 'لا يوجد'}`);
    }

    if (oldChannel.nsfw !== newChannel.nsfw) {
        changes.push(`**NSFW:**\nقبل: ${oldChannel.nsfw}\nبعد: ${newChannel.nsfw}`);
    }

    if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
        changes.push(`**Slowmode:**\nقبل: ${oldChannel.rateLimitPerUser || 0} ثانية\nبعد: ${newChannel.rateLimitPerUser || 0} ثانية`);
    }

    if (changes.length === 0) return;

    const embed = new EmbedBuilder()
        .setColor('#ffaa00')
        .setTitle('♻️ تم تعديل قناة')
        .addFields(
            { name: '🛡️ الإداري', value: executor, inline: false },
            { name: '📌 القناة', value: `${newChannel}`, inline: false },
            { name: '🆔 ID القناة', value: newChannel.id, inline: false },
            { name: '🔄 التغييرات', value: changes.join('\n\n'), inline: false }
        )
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
});











// ==================== لوقات الرولات ====================














// إنشاء رول
client.on('roleCreate', async role => {
    const channel = role.guild.channels.cache.get('1517931908166848653');
    if (!channel) return;

    let executor = 'غير معروف';

    try {
        const logs = await role.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.RoleCreate
        });

        const log = logs.entries.first();
        if (log?.executor) executor = `<@${log.executor.id}>`;
    } catch {}

    const embed = new EmbedBuilder()
        .setColor('#00ff66')
        .setTitle('✅ تم إنشاء رول')
        .addFields(
            { name: '🛡️ المسؤول', value: executor, inline: false },
            { name: '🎭 الرول', value: `${role}`, inline: false },
            { name: '📌 اسم الرول', value: role.name, inline: false },
            { name: '🆔 ID الرول', value: role.id, inline: false }
        )
        .setTimestamp();

    channel.send({ embeds: [embed] });
});

// حذف رول
client.on('roleDelete', async role => {
    const channel = role.guild.channels.cache.get('1517931908166848653');
    if (!channel) return;

    let executor = 'غير معروف';

    try {
        const logs = await role.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.RoleDelete
        });

        const log = logs.entries.first();
        if (log?.executor) executor = `<@${log.executor.id}>`;
    } catch {}

    const embed = new EmbedBuilder()
        .setColor('#ff3333')
        .setTitle('🗑️ تم حذف رول')
        .addFields(
            { name: '🛡️ المسؤول', value: executor, inline: false },
            { name: '📌 اسم الرول', value: role.name, inline: false },
            { name: '🆔 ID الرول', value: role.id, inline: false }
        )
        .setTimestamp();

    channel.send({ embeds: [embed] });
});

// تعديل رول
client.on('roleUpdate', async (oldRole, newRole) => {
    const channel = newRole.guild.channels.cache.get('1517931908166848653');
    if (!channel) return;

    let executor = 'غير معروف';

    try {
        const logs = await newRole.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.RoleUpdate
        });

        const log = logs.entries.first();
        if (log?.executor) executor = `<@${log.executor.id}>`;
    } catch {}

    let changes = [];

    if (oldRole.name !== newRole.name) {
        changes.push(`**اسم الرول:**\nقبل: ${oldRole.name}\nبعد: ${newRole.name}`);
    }

    if (oldRole.color !== newRole.color) {
        changes.push(`**لون الرول:**\nقبل: ${oldRole.hexColor}\nبعد: ${newRole.hexColor}`);
    }

    if (oldRole.hoist !== newRole.hoist) {
        changes.push(`**عرض الرول منفصل:**\nقبل: ${oldRole.hoist}\nبعد: ${newRole.hoist}`);
    }

    if (oldRole.mentionable !== newRole.mentionable) {
        changes.push(`**قابل للمنشن:**\nقبل: ${oldRole.mentionable}\nبعد: ${newRole.mentionable}`);
    }

    if (changes.length === 0) return;

    const embed = new EmbedBuilder()
        .setColor('#ffaa00')
        .setTitle('♻️ تم تعديل رول')
        .addFields(
            { name: '🛡️ المسؤول', value: executor, inline: false },
            { name: '🎭 الرول', value: `${newRole}`, inline: false },
            { name: '🆔 ID الرول', value: newRole.id, inline: false },
            { name: '🔄 التغييرات', value: changes.join('\n\n'), inline: false }
        )
        .setTimestamp();

    channel.send({ embeds: [embed] });
});

// إعطاء أو سحب رول من عضو
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const channel = newMember.guild.channels.cache.get('1517931908166848653');
    if (!channel) return;

    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    const addedRole = newRoles.find(role => !oldRoles.has(role.id));
    const removedRole = oldRoles.find(role => !newRoles.has(role.id));

    if (!addedRole && !removedRole) return;

    let executor = 'غير معروف';

    try {
        const logs = await newMember.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberRoleUpdate
        });

        const log = logs.entries.first();
        if (log?.executor) executor = `<@${log.executor.id}>`;
    } catch {}

    if (addedRole) {
        const embed = new EmbedBuilder()
            .setColor('#00ff66')
            .setTitle('➕ تم إعطاء رول')
            .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👤 العضو', value: `${newMember}`, inline: false },
                { name: '🎭 الرول', value: `${addedRole}`, inline: false },
                { name: '🛡️ المسؤول', value: executor, inline: false }
            )
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }

    if (removedRole) {
        const embed = new EmbedBuilder()
            .setColor('#ff3333')
            .setTitle('➖ تم سحب رول')
            .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👤 العضو', value: `${newMember}`, inline: false },
                { name: '🎭 الرول', value: `${removedRole.name}`, inline: false },
                { name: '🛡️ المسؤول', value: executor, inline: false }
            )
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }
});






















client.on('interactionCreate', async interaction => {

    // نافذة إدخال الأغنية
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'music_play_modal') {
            if (interaction.channel.id !== MUSIC_CHANNEL_ID) {
                return interaction.reply({
                    content: '❌ الأغاني فقط في روم الأغاني.',
                    ephemeral: true
                });
            }

            const songQuery = interaction.fields.getTextInputValue('song_input');
            const voiceChannel = interaction.member.voice.channel;

            if (!voiceChannel) {
                return interaction.reply({
                    content: '❌ لازم تدخل روم صوتي أولاً.',
                    ephemeral: true
                });
            }

            await interaction.deferReply();

            let queue = musicQueues.get(interaction.guild.id);

            if (!queue) {
                queue = {
                    songs: [],
                    player: createAudioPlayer({
                        behaviors: {
                            noSubscriber: NoSubscriberBehavior.Play
                        }
                    }),
                    connection: null,
                    current: null
                };

                queue.player.on(AudioPlayerStatus.Idle, async () => {
                    queue.current = null;

                    const nextSong = queue.songs.shift();
                    if (!nextSong) return;

                    try {
                        const stream = await playdl.stream(nextSong.url);
                        const resource = createAudioResource(stream.stream, {
                            inputType: stream.type
                        });

                        queue.current = nextSong;
                        queue.player.play(resource);
                    } catch (err) {
                        console.error(err);
                    }
                });

                musicQueues.set(interaction.guild.id, queue);
            }
            try {
                let song;

                if (playdl.yt_validate(songQuery) !== 'video') {
                    return interaction.editReply('❌ حط رابط يوتيوب مباشر فقط حالياً.');
                }

                console.log('STEP 1');
const info = await playdl.video_info(songQuery);
console.log('STEP 2');

                song = {
                    title: info.video_details.title,
                    url: info.video_details.url
                };

                queue.songs.push(song);

                if (!queue.connection) {
                    queue.connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: interaction.guild.id,
                        adapterCreator: interaction.guild.voiceAdapterCreator,
                        selfDeaf: false
                    });

                    queue.connection.subscribe(queue.player);
                }

                if (!queue.current) {
                    const nextSong = queue.songs.shift();
                    console.log('STEP 3');
const stream = await playdl.stream(nextSong.url);
console.log('STEP 4');
                    const resource = createAudioResource(stream.stream, {
                        inputType: stream.type
                    });

                    queue.current = nextSong;
                    queue.player.play(resource);

                    return interaction.editReply(`▶️ شغال الآن: **${nextSong.title}**`);
                }

                return interaction.editReply(`✅ انضافت للقائمة: **${song.title}**`);

            } catch (error) {
                console.error(error);
                return interaction.editReply('❌ صار خطأ وأنا بحاول أشغل الأغنية.');
            }
  client.on('interactionCreate', async interaction => {

    // أزرار لوحة الأغاني
    if (interaction.isButton()) {
        try {
            return interaction.reply({
                content: `✅ الزر شغال: ${interaction.customId}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('BUTTON ERROR:', error);
        }
    }

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'panel') {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎵 Control Panel')
            .setDescription('Click a button, and control the music bot!');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('music_play')
                    .setEmoji('▶️')
                    .setLabel('Play')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('music_pause')
                    .setEmoji('⏸️')
                    .setLabel('Pause')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('music_skip')
                    .setEmoji('⏭️')
                    .setLabel('Skip')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('music_queue')
                    .setEmoji('📋')
                    .setLabel('Queue')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('music_stop')
                    .setEmoji('⏹️')
                    .setLabel('Stop')
                    .setStyle(ButtonStyle.Danger)
            );

        return interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
});
        if (interaction.customId === 'music_play') {
            const modal = new ModalBuilder()
                .setCustomId('music_play_modal')
                .setTitle('تشغيل أغنية');

            const songInput = new TextInputBuilder()
                .setCustomId('song_input')
                .setLabel('حط رابط يوتيوب أو اسم الأغنية')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const row = new ActionRowBuilder().addComponents(songInput);

            modal.addComponents(row);

            return interaction.showModal(modal);
        }

        if (interaction.customId === 'music_pause') {
            const queue = musicQueues.get(interaction.guild.id);

            if (!queue || !queue.current) {
                return interaction.reply({
                    content: '❌ ما في أغنية شغالة.',
                    ephemeral: true
                });
            }

            queue.player.pause();

            return interaction.reply({
                content: '⏸️ تم إيقاف الأغنية مؤقتاً.',
                ephemeral: true
            });
        }

        if (interaction.customId === 'music_skip') {
            const queue = musicQueues.get(interaction.guild.id);

            if (!queue || !queue.current) {
                return interaction.reply({
                    content: '❌ ما في أغنية شغالة.',
                    ephemeral: true
                });
            }

            queue.player.stop();

            return interaction.reply({
                content: '⏭️ تم عمل سكيب.',
                ephemeral: true
            });
        }

        if (interaction.customId === 'music_queue') {
            const queue = musicQueues.get(interaction.guild.id);

            if (!queue) {
                return interaction.reply({
                    content: '📜 القائمة فاضية.',
                    ephemeral: true
                });
            }

            const current = queue.current
                ? `▶️ الآن: **${queue.current.title}**\n\n`
                : 'ما في أغنية شغالة.\n\n';

            const list = queue.songs.length
                ? queue.songs.map((s, i) => `${i + 1}. ${s.title}`).join('\n')
                : 'القائمة فاضية.';

            return interaction.reply({
                content: current + '📜 **القائمة:**\n' + list,
                ephemeral: true
            });
        }

        if (interaction.customId === 'music_stop') {
            const queue = musicQueues.get(interaction.guild.id);

            if (!queue) {
                return interaction.reply({
                    content: '❌ ما في شيء شغال.',
                    ephemeral: true
                });
            }

            queue.songs = [];
            queue.current = null;
            queue.player.stop();

            if (queue.connection) {
                queue.connection.destroy();
            }

            musicQueues.delete(interaction.guild.id);

            return interaction.reply({
                content: '⏹️ تم إيقاف الأغاني.',
                ephemeral: true
            });
        }
    }

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'join') {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({
                content: '❌ لازم تدخل روم صوتي أولاً',
                ephemeral: true
            });
        }

        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });

        return interaction.reply(`✅ دخلت روم: ${voiceChannel.name}`);
    }

    if (interaction.commandName === 'clear') {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return interaction.reply({
                content: '❌ ما عندك صلاحية حذف الرسائل.',
                ephemeral: true
            });
        }

        if (!interaction.guild.members.me.permissions.has('ManageMessages')) {
            return interaction.reply({
                content: '❌ البوت ما عنده صلاحية حذف الرسائل.',
                ephemeral: true
            });
        }

        const amount = interaction.options.getInteger('amount');

        try {
            await interaction.channel.bulkDelete(amount, true);

            return interaction.reply({
                content: `✅ تم حذف ${amount} رسالة.`,
                ephemeral: true
            });

        } catch (error) {
            console.error(error);

            return interaction.reply({
                content: '❌ ما قدرت أحذف الرسائل. يمكن الرسائل أقدم من 14 يوم.',
                ephemeral: true
            });
        }
    }

    if (interaction.commandName === 'panel') {
        if (interaction.channel.id !== MUSIC_CHANNEL_ID) {
            return interaction.reply({
                content: '❌ لوحة الأغاني فقط في روم الأغاني.',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎵 Control Panel')
            .setDescription('Click a button, and control the music bot!')
            .addFields({
                name: 'User Friendly Control Panel',
                value: '▶️ Play | ⏸️ Pause | ⏭️ Skip | 📋 Queue | ⏹️ Stop'
            })
            .setFooter({ text: 'Music Control Panel' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('music_play')
                    .setEmoji('▶️')
                    .setLabel('Play')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('music_pause')
                    .setEmoji('⏸️')
                    .setLabel('Pause')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('music_skip')
                    .setEmoji('⏭️')
                    .setLabel('Skip')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('music_queue')
                    .setEmoji('📋')
                    .setLabel('Queue')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('music_stop')
                    .setEmoji('⏹️')
                    .setLabel('Stop')
                    .setStyle(ButtonStyle.Danger)
            );

        return interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
});




// ==================== لوق ديسكونكت من الروم الصوتي ====================
client.on('voiceStateUpdate', async (oldState, newState) => {
    const logChannel = oldState.guild.channels.cache.get('1517957827027669093');
    if (!logChannel) return;

    const member = oldState.member;
    if (!member) return;

    // لازم يكون كان داخل روم وطلع منه
    if (!oldState.channel || newState.channel) return;

    let executor = 'غير معروف';
    let reason = 'لا يوجد سبب';

    try {
        const logs = await oldState.guild.fetchAuditLogs({
            limit: 5,
            type: AuditLogEvent.MemberDisconnect
        });

        const log = logs.entries.find(entry =>
            Date.now() - entry.createdTimestamp < 10000
        );

        if (!log) return;

        if (log.executor) executor = `<@${log.executor.id}>`;
        if (log.reason) reason = log.reason;
    } catch {}

    const embed = new EmbedBuilder()
        .setColor('#ff3333')
        .setTitle('📵 تم فصل عضو من روم صوتي')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
            { name: '👤 العضو المفصول', value: `${member}`, inline: false },
            { name: '🛡️ المسؤول', value: executor, inline: false },
            { name: '📤 كان في روم', value: `${oldState.channel.name}`, inline: false },
            { name: '📌 السبب', value: reason, inline: false },
            { name: '🆔 ID العضو', value: member.id, inline: false }
        )
        .setFooter({ text: oldState.guild.name })
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
});









// ==================== إحصائيات الرسائل والصوت ====================
const STATS_FILE = './stats.json';

function loadStats() {
    if (!fs.existsSync(STATS_FILE)) return {};
    return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
}

function saveStats(stats) {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

function ensureUser(stats, guildId, userId) {
    if (!stats[guildId]) stats[guildId] = {};
    if (!stats[guildId][userId]) {
        stats[guildId][userId] = {
            messages: 0,
            voiceMs: 0,
            joinedAt: null
        };
    }
}

client.on('messageCreate', message => {
    if (!message.guild || message.author.bot) return;

    const stats = loadStats();
    ensureUser(stats, message.guild.id, message.author.id);

    stats[message.guild.id][message.author.id].messages += 1;
    saveStats(stats);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    const stats = loadStats();
    const guildId = newState.guild.id;
    const userId = newState.id;

    if (newState.member?.user.bot) return;

    if (!oldState.channel && newState.channel) {
        ensureUser(stats, guildId, userId);
        stats[guildId][userId].joinedAt = Date.now();
        saveStats(stats);
        return;
    }

    if (oldState.channel && !newState.channel) {
        ensureUser(stats, guildId, userId);

        const joinedAt = stats[guildId][userId].joinedAt;
        if (joinedAt) {
            stats[guildId][userId].voiceMs += Date.now() - joinedAt;
            stats[guildId][userId].joinedAt = null;
        }

        saveStats(stats);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'stats') {
        const stats = loadStats();
        const guildStats = stats[interaction.guild.id] || {};

        let topVoice = null;
        let topMessages = null;

        for (const [userId, data] of Object.entries(guildStats)) {
            let voiceMs = data.voiceMs || 0;

            if (data.joinedAt) {
                voiceMs += Date.now() - data.joinedAt;
            }

            if (!topVoice || voiceMs > topVoice.voiceMs) {
                topVoice = { userId, voiceMs };
            }

            if (!topMessages || data.messages > topMessages.messages) {
                topMessages = { userId, messages: data.messages };
            }
        }

        const voiceMinutes = topVoice ? Math.floor(topVoice.voiceMs / 60000) : 0;

        const embed = new EmbedBuilder()
            .setColor('#00aaff')
            .setTitle('📊 إحصائيات السيرفر')
            .addFields(
                {
                    name: '🎙️ أكثر شخص تواجد بالصوت',
                    value: topVoice ? `<@${topVoice.userId}>\n⏱️ ${voiceMinutes} دقيقة` : 'لا يوجد بيانات',
                    inline: false
                },
                {
                    name: '💬 أكثر شخص تفاعل بالرسائل',
                    value: topMessages ? `<@${topMessages.userId}>\n✉️ ${topMessages.messages} رسالة` : 'لا يوجد بيانات',
                    inline: false
                }
            )
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
});








// ==================== معلومات العضو ====================
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.guild) return;

    if (message.content === 'معلوماتي') {
        if (message.channel.id !== '1480695622582407419') return;

        const member = message.member;

        const joinedAt = member.joinedTimestamp
            ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
            : 'غير معروف';

        const createdAt = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`;

        const roles = member.roles.cache
            .filter(role => role.id !== message.guild.id)
            .map(role => role.toString())
            .join(', ') || 'لا يوجد رولات';

        await message.reply({
            embeds: [{
                title: `معلومات ${member.user.username}`,
                color: 0x00AEFF,
                thumbnail: {
                    url: member.user.displayAvatarURL()
                },
                fields: [
                    {
                        name: '📅 تاريخ إنشاء الحساب',
                        value: createdAt
                    },
                    {
                        name: '📥 تاريخ دخول السيرفر',
                        value: joinedAt
                    },
                    {
                        name: '🎭 الرولات الحالية',
                        value: roles
                    }
                ]
            }]
        });
    }
});





client.login(process.env.TOKEN);
