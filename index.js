const { Client, GatewayIntentBits, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
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

        await interaction.reply(`✅ دخلت روم: ${voiceChannel.name}`);
    }
});








client.login(process.env.TOKEN);