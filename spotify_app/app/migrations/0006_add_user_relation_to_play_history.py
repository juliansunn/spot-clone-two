# Generated by Django 3.2 on 2022-08-06 21:27

from django.db import migrations, models
class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_alter_playhistory_unique_together'),
    ]

    operations = [
        migrations.AlterField(
            model_name='album',
            name='name',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='artist',
            name='name',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='track',
            name='name',
            field=models.CharField(max_length=200),
        ),
    ]