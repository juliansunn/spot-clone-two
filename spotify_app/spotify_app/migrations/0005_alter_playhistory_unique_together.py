# Generated by Django 3.2 on 2022-08-05 15:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('spotify_app', '0004_auto_20220803_2251'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='playhistory',
            unique_together={('track', 'played_at')},
        ),
    ]
