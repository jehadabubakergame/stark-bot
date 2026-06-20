const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('join')
        .setDescription('يدخل البوت إلى رومك الصوتي')
        .toJSON(),

    new SlashCommandBuilder()
        .setName('stats')
        .setDescription('يعرض إحصائيات السيرفر')
        .toJSON(),

    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('حذف عدد من الرسائل')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('عدد الرسائل من 1 إلى 100')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName('music')
        .setDescription('أوامر الأغاني')
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('اختار الأمر')
                .setRequired(true)
                .addChoices(
                    { name: 'تشغيل', value: 'play' },
                    { name: 'إيقاف', value: 'stop' },
                    { name: 'سكيب', value: 'skip' },
                    { name: 'القائمة', value: 'list' }
                )
        )
        .addStringOption(option =>
            option
                .setName('song')
                .setDescription('اسم الأغنية أو رابط يوتيوب')
                .setRequired(false)
        )
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('REGISTER FILE IS RUNNING');
        console.log('جاري تسجيل الأوامر...');

        await rest.put(
            Routes.applicationCommands('1517902347135877220'),
            { body: commands }
        );

        console.log('تم تسجيل الأوامر بنجاح ومعهم music');
    } catch (error) {
        console.error(error);
    }
})();
